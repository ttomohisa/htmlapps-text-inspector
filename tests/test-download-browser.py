"""Offline native export/label regression; requires development-only Playwright.
Run: CHROMIUM_PATH=/usr/bin/chromium python tests/test-download-browser.py
"""
import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = '日本語 café e\u0301 😀\nsecond\tline\u200b\u00a0\u202f\u2060\ufeff  \n'


async def run_case(browser, relative, width, lang):
    context = await browser.new_context(viewport={'width': width, 'height': 700}, locale='ja-JP', offline=True, accept_downloads=True)
    page = await context.new_page()
    errors, requests = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda request: requests.append(request.url) if request.url.startswith(('http:', 'https:')) else None)
    await page.goto((ROOT / relative).as_uri())
    await page.locator('#downloadButton').wait_for()
    if lang == 'en':
        await page.locator('#languageButton').click()
    expected = {
        '#textInput': ('Text to analyze', '分析するテキスト'),
        '#targetSelect': ('Target character count', '目標文字数'),
        '#targetInput': ('Custom target character count', '自由入力の目標文字数'),
        '#analysisSection': ('Text analysis', '文章分析'),
        '[role=tablist]': ('Analysis views', '分析項目'),
        '#toastClose': ('Close', '閉じる'),
    }
    for _ in range(2):
        for selector, labels in expected.items():
            assert await page.locator(selector).get_attribute('aria-label') == labels[0 if lang == 'en' else 1], selector
        await page.locator('#languageButton').click()
        lang = 'ja' if lang == 'en' else 'en'
    for original in [ORIGINAL, '', '\ufeffleading BOM', '\t  \n']:
        await page.locator('#textInput').fill(original)
        async with page.expect_download() as download_info:
            await page.locator('#downloadButton').click()
        download = await download_info.value
        assert download.suggested_filename == 'text-inspector.txt'
        assert Path(await download.path()).read_bytes() == original.encode('utf-8')
        assert await page.locator('#textInput').input_value() == original
        assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'toolbar must not overflow'
    assert not await page.locator('a[download]').count(), 'temporary links are removed'
    assert not errors, errors
    assert not requests, requests
    print(f'PASS {relative} {width}px {lang}: labels, real UTF-8/empty downloads, original input, toolbar, offline', flush=True)
    await context.close()


async def main():
    async with async_playwright() as playwright:
        launch = {'args': ['--no-sandbox', '--disable-gpu']}
        if os.environ.get('CHROMIUM_PATH'):
            launch['executable_path'] = os.environ['CHROMIUM_PATH']
        browser = await playwright.chromium.launch(**launch)
        try:
            for relative in ['dist/index.html', 'dist/index.self-extract.html']:
                for width, lang in [(320, 'ja'), (320, 'en'), (1280, 'ja'), (1280, 'en')]:
                    await run_case(browser, relative, width, lang)
        finally:
            await browser.close()


asyncio.run(main())
