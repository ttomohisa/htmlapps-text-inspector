"""Offline native-browser help regression: CHROMIUM_PATH=/usr/bin/chromium python tests/test-help-browser.py.
Use --source for the pre-build source template. Requires development-only Playwright.
"""
import asyncio
import os
from pathlib import Path
import sys
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]


async def check_layout(page, width, height):
    dialog = page.locator('#helpDialog')
    box = await dialog.bounding_box()
    assert box and box['y'] >= 13, f'help top is inside the viewport: {box}'
    assert box['y'] + box['height'] <= height - 13, f'help bottom has a visible margin: {box}'
    if width <= 620:
        assert box['y'] <= 20, f'phone help starts near the top, not in a bottom sheet: {box}'
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'no horizontal overflow'
    body = page.locator('#helpBody')
    assert await body.count() == 1, 'help owns an independent scrolling body'
    head_box = await page.locator('#helpDialog .dialog-head').bounding_box()
    body_box = await body.bounding_box()
    assert body_box['y'] >= head_box['y'] + head_box['height'] - 1, 'body stays below header'
    assert body_box['height'] > 0, 'body remains usable in a short viewport'
    assert await dialog.evaluate('(node) => node.scrollHeight <= node.clientHeight + 1'), 'dialog itself does not scroll'


async def run_case(browser, relative, width, height, lang):
    context = await browser.new_context(viewport={'width': width, 'height': height}, locale='ja-JP', offline=True)
    page = await context.new_page()
    errors, requests = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda request: requests.append(request.url) if request.url.startswith(('http:', 'https:')) else None)
    await page.goto((ROOT / relative).as_uri())
    await page.locator('#helpButton').wait_for()
    assert not await page.locator('#helpDialog').is_visible(), 'closed help is hidden'
    if lang == 'en':
        await page.locator('#languageButton').click()
    original = 'Keep this text.\u200b'
    await page.locator('#textInput').fill(original)
    for close_method in ['button', 'escape', 'backdrop']:
        await page.locator('#helpButton').click()
        await check_layout(page, width, height)
        body = page.locator('#helpBody')
        assert await body.evaluate('(node) => node.scrollTop') == 0, 'each open begins at the top'
        await page.keyboard.press('Tab')
        assert await body.evaluate('(node) => node === document.activeElement'), 'Tab reaches the reading area'
        if await body.evaluate('(node) => node.scrollHeight > node.clientHeight'):
            await page.keyboard.press('PageDown')
            await page.wait_for_function('document.getElementById("helpBody").scrollTop > 0')
            await body.evaluate('(node) => { node.scrollTop = 0; }')
        first = await page.locator('#helpBody .help-section').first.bounding_box()
        body_box = await body.bounding_box()
        assert first['y'] >= body_box['y'], 'first instructions are not clipped under the title'
        close_before = await page.locator('#helpClose').bounding_box()
        await body.evaluate('(node) => { node.scrollTop = node.scrollHeight; }')
        close_after = await page.locator('#helpClose').bounding_box()
        assert close_before == close_after, 'close button stays fixed while reading'
        last = await page.locator('#helpBody .help-section').last.bounding_box()
        assert last['y'] + last['height'] <= body_box['y'] + body_box['height'], 'final paragraph is reachable'
        if close_method == 'button':
            await page.locator('#helpClose').click()
        elif close_method == 'escape':
            await page.keyboard.press('Escape')
        else:
            await page.mouse.click(2, 2)
        assert not await page.locator('#helpDialog').is_visible(), close_method
        assert await page.locator('#helpButton').evaluate('(node) => node === document.activeElement'), 'focus returns to Help'
        assert await page.locator('#textInput').input_value() == original
    # A resized/rotated open modal remains viewport-bounded and readable.
    await page.locator('#helpButton').click()
    await page.set_viewport_size({'width': 320, 'height': 300})
    await check_layout(page, 320, 300)
    await page.keyboard.press('Escape')
    assert not errors, errors
    assert not requests, requests
    print(f'PASS {relative} {width}x{height} {lang}: top inset, body scroll, reopen, close/Escape/backdrop, resize, offline', flush=True)
    await context.close()


async def main():
    async with async_playwright() as playwright:
        launch = {'args': ['--no-sandbox', '--disable-gpu']}
        if os.environ.get('CHROMIUM_PATH'):
            launch['executable_path'] = os.environ['CHROMIUM_PATH']
        browser = await playwright.chromium.launch(**launch)
        try:
            files = ['src/index.template.html'] if '--source' in sys.argv else ['dist/index.html', 'dist/index.self-extract.html']
            for relative in files:
                for width, height, lang in [(320, 480, 'ja'), (320, 480, 'en'), (390, 844, 'ja'), (390, 844, 'en'), (812, 375, 'en'), (1280, 900, 'ja')]:
                    await run_case(browser, relative, width, height, lang)
        finally:
            await browser.close()


asyncio.run(main())
