import {Browser, launch, Page} from 'puppeteer';

export async function createBrowserAndPage(): Promise<[Browser, Page]> {
    const browser = await launch({
        headless: true,
    });
    const page = await browser.newPage();

    return [browser, page];
}