import {MouseButton, Page} from 'puppeteer';

interface Options {
    button: MouseButton;
    delay: number;
    timeout: number;
}

export async function waitAndClick(page: Page, selector: string, options: Options = { button: 'left', delay: 0, timeout: 30000 }): Promise<void> {
    await page.waitForSelector(selector, {
        timeout: options.timeout
    });
    return page.click(selector, {
        button: options.button,
        delay: options.delay
    });
}