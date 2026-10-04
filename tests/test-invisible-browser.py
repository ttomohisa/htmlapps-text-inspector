"""Real-browser regression tests. pip install playwright; playwright install chromium.
Run: python tests/test-invisible-browser.py [--source]
CHROMIUM_PATH may select an installed Chromium binary instead.
"""
import asyncio
import os
from pathlib import Path
import sys
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
CODES = ['U+200B', 'U+00A0', 'U+202F', 'U+2060', 'U+FEFF']
MARKERS = ['[ZWSP]', '[NBSP]', '[NNBSP]', '[WJ]', '[BOM]']

async def fill(page, text):
    await page.locator('#textInput').fill(text)
    await page.wait_for_timeout(100)

async def run_case(browser, path, width, lang):
    context = await browser.new_context(viewport={'width': width, 'height': 900}, locale='ja-JP', offline=True)
    errors, requests = [], []
    page = await context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda request: requests.append(request.url) if request.url.startswith(('http:', 'https:')) else None)
    await page.goto(path.as_uri())
    await page.locator('#textInput').wait_for()
    if lang == 'en':
        await page.locator('#languageButton').click()
    assert await page.locator('html').get_attribute('lang') == lang
    text = '<img src=x onerror=alert(1)>😀e\u0301\u200bA\u00a0B\u202fC\u2060D\ufeff\u200b'
    await fill(page, text)
    await page.locator('#tab-checks').click()
    cards = page.locator('#checksList .actionable').filter(has_text='U+')
    assert await cards.count() == 5, 'five grouped Unicode checks appear'
    for code, marker in zip(CODES, MARKERS):
        card = page.locator('#checksList .actionable').filter(has_text=code)
        await card.focus()
        await page.keyboard.press('Enter' if code != 'U+00A0' else 'Space')
        await page.wait_for_timeout(80)
        focus = page.locator('#xrayPreview .issue-focus.invisible-marker')
        assert await focus.count() == 1
        assert await focus.text_content() == marker
        assert code in await focus.get_attribute('title')
        assert await focus.evaluate('(node) => node === document.activeElement'), 'jump moves keyboard focus into X-Ray'
        assert await page.locator('#panel-xray').is_visible()
        await page.locator('#tab-checks').click()
    assert await page.locator('#textInput').input_value() == text
    assert await page.locator('#xrayPreview img').count() == 0, 'untrusted text stays text'
    assert await page.locator('#xrayPreview .invisible-marker').count() == 6
    await page.locator('#copyButton').evaluate("""node => {
      window.copiedText = null;
      Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async text => {window.copiedText = text;}}});
    }""")
    await page.locator('#copyButton').click()
    assert await page.evaluate('window.copiedText') == text, 'Copy retains the original invisible characters'
    # Clipboard fallback also selects the original editor value, never X-Ray markers.
    await page.evaluate("""() => {
      Object.defineProperty(navigator, 'clipboard', {configurable:true,value:undefined});
      document.execCommand = () => { window.fallbackText = document.activeElement.value.substring(document.activeElement.selectionStart, document.activeElement.selectionEnd); return true; };
    }""")
    await page.locator('#copyButton').click()
    assert await page.evaluate('window.fallbackText') == text
    await page.locator('#clearButton').click()
    await page.locator('#confirmCancel').click()
    assert await page.locator('#textInput').input_value() == text
    await page.locator('#sampleButton').click()
    await page.keyboard.press('Escape')
    assert await page.locator('#textInput').input_value() == text
    await page.locator('#clearButton').click()
    await page.locator('#confirmAccept').click()
    await page.wait_for_timeout(100)
    assert await page.locator('#textInput').input_value() == ''
    assert await page.locator('.invisible-marker').count() == 0
    await page.locator('#undoButton').click()
    await page.wait_for_timeout(100)
    assert await page.locator('#textInput').input_value() == text
    assert await page.locator('.invisible-marker').count() == 6
    await page.locator('#redoButton').click()
    await page.wait_for_timeout(100)
    assert await page.locator('.invisible-marker').count() == 0
    # Trim-empty inputs still receive findings.
    await fill(page, '\u00a0\u202f\ufeff')
    await page.locator('#tab-checks').click()
    assert await cards.count() == 3
    assert await page.locator('.invisible-marker').count() == 3
    await fill(page, '👩🏽‍💻 می\u200cروم e\u0301')
    assert await cards.count() == 0
    assert await page.locator('.invisible-marker').count() == 0
    # Markers coexist with long-sentence and word highlighting.
    await fill(page, 'elephant\u2060elephant ' + '文' * 85 + '\u200b。')
    await page.locator('#tab-frequency').click()
    await page.locator('#frequencyList button').filter(has_text='elephant').first.click()
    assert await page.locator('.invisible-marker.long-sentence').count() == 2
    assert await page.locator('.word-highlight').count() >= 2
    # Cap marker DOM without losing a rare later type's jump target.
    await fill(page, '\u200b' * 1100 + '\u00a0')
    await page.locator('#tab-checks').click()
    assert await cards.count() == 2
    assert '1,100' in await cards.filter(has_text='U+200B').text_content()
    await cards.filter(has_text='U+00A0').click()
    await page.wait_for_timeout(80)
    assert await page.locator('.invisible-marker').count() == 1000
    assert await page.locator('.issue-focus.invisible-marker').text_content() == '[NBSP]'
    assert '1,000' in await page.locator('#xrayMarkerNote').text_content()
    assert await page.locator('#xrayMarkerNote').is_visible()
    await page.locator('#tab-checks').click()
    await cards.filter(has_text='U+200B').click()
    assert await page.locator('.invisible-marker').count() == 1000
    # Editing removes selected issue state, including all stale focus markers.
    await fill(page, 'ordinary text')
    assert await page.locator('.invisible-marker, .issue-focus').count() == 0
    assert not await page.locator('#xrayMarkerNote').is_visible()
    # The 200k limit is UTF-16-based and does not truncate the input / headline count.
    limited_text = '😀' * 99999 + '\u200b\u00a0\u202f'
    await fill(page, limited_text)
    await page.locator('#tab-checks').click()
    assert await cards.count() == 2
    assert await page.locator('#charCount').text_content() == '100,002'
    assert await page.locator('#textInput').input_value() == limited_text
    assert '200,000' in await page.locator('#checksList').text_content() or '20万' in await page.locator('#checksList').text_content()
    # Dense worst case still creates only 1,000 marker nodes; all counts are retained.
    await fill(page, '\u200b' * 200000)
    assert await page.locator('.invisible-marker').count() == 1000
    assert '200,000' in await cards.text_content()
    # Language switching and responsive layout do not alter the original.
    await fill(page, text)
    await page.locator('#languageButton').click()
    await page.locator('#tab-xray').click()
    assert await page.locator('#textInput').input_value() == text
    assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'no horizontal page overflow'
    assert await page.locator('.invisible-marker').count() == 6
    assert not errors, errors
    assert not requests, requests
    print(f'PASS {path.name} {width}px {lang}: checks, keyboard, markers, limits, original copy, edit/history/cancel, offline', flush=True)
    await context.close()

async def main():
    async with async_playwright() as playwright:
        launch = {'args': ['--no-sandbox', '--disable-gpu']}
        if os.environ.get('CHROMIUM_PATH'):
            launch['executable_path'] = os.environ['CHROMIUM_PATH']
        browser = await playwright.chromium.launch(**launch)
        try:
            if '--source' in sys.argv:
                cases = [('src/index.template.html', 1280, 'en')]
            else:
                cases = [('dist/index.html', 1280, 'en'), ('dist/index.html', 320, 'ja'),
                         ('dist/index.self-extract.html', 1280, 'ja'), ('dist/index.self-extract.html', 320, 'en')]
            for path, width, lang in cases:
                await run_case(browser, ROOT / path, width, lang)
        finally:
            await browser.close()

asyncio.run(main())
