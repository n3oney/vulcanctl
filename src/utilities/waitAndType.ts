import {Page} from 'puppeteer';

interface Options {
    delay: number;
    timeout: number;
}

export async function waitAndType(page: Page, selector: string, text: string, options: Options = { delay: 0, timeout: 30000 }): Promise<void> {
    await page.waitForSelector(selector, {
        timeout: options.timeout
    });
    return page.type(selector, text, {
        delay: options.delay
    });
}