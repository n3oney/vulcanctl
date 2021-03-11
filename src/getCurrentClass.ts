import {createBrowserAndPage} from "./utilities/createBrowserAndPage";
import {waitAndClick} from "./utilities/waitAndClick";
import * as yargs from "yargs";
import {waitAndType} from "./utilities/waitAndType";

interface Options {
    verbose?: boolean;
    v?: boolean;
    email: string;
    password: string;
    home: string;
}

export async function getCurrentClass(yargs: yargs.Arguments<Options>) {
    const verbose = yargs.verbose || yargs.v;
    const [, page] = await createBrowserAndPage();

    await page.goto(yargs.home);

    await waitAndClick(page, '.loginButton');
    if (verbose) console.log('Clicked login button.');

    await waitAndType(page, '#LoginName', yargs.email);
    if (verbose) console.log('E-mail typed in.');

    await waitAndType(page, '#Password', yargs.password);
    if (verbose) console.log('Pasword typed in.');

    await waitAndClick(page, 'input[type=submit]');
    if (verbose) console.log('Logging in...');

    await page.waitForNavigation({
        waitUntil: 'networkidle0'
    });

    if (page.url() !== yargs.home) {
        await page.waitForNavigation({
            waitUntil: 'networkidle0'
        });
        if (page.url() !== yargs.home) {
            throw Error('Failed to log in.');
        }
    }

    if (verbose) console.log('Logged in!');

    await page.waitForSelector('.newAppLink');
    const href = await page.evaluate(() => (document.querySelector('a[title=\'Uczeń\']')! as HTMLAnchorElement).href);

    await Promise.all([
        page.goto(href),
        page.waitForNavigation({
            waitUntil: 'networkidle0'
        })
    ]);
    if (verbose) console.log('Navigation finished.');

    const fetchResult = await page.evaluate(async (url) => {
        const date = new Date();
        date.setDate(date.getDate() + (1 - date.getDay()));

        const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
        const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
        const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                //@ts-ignore
                'X-V-RequestVerificationToken': window.Vulcan.Common2015.helpers.ParamHelper.get('antiForgeryToken'),
                //@ts-ignore
                'X-V-AppGuid': window.Vulcan.Common2015.helpers.ParamHelper.get('appGuid')
            },
            body: JSON.stringify({
                data: `${day}-${month}-${year}`
            })
        });
        return await res.json();
    }, page.url().replace('Start', 'PlanZajec.mvc/Get')) as {
        data: {
            Data: string,
            Headers: {
                Text: string,
                Width: number | null,
                Distinction: boolean,
                Flex: number
            }[],
            Rows: any[],
            Additionals: any[]
        },
        success: boolean
    };

    interface Class {
        name: string;
        lessonHour: number;
        startHour: string;
        endHour: string;
    }

    interface Day {
        name: string;
        date: string;
        classes: (Class | null)[];
    }

    interface Data {
        days: Day[]
    }

    const parsedData = { days: [] } as Data;

    const headers = fetchResult.data.Headers.slice(1);

    for(const headerIndex in headers) {
        const header = headers[headerIndex];

        const classes: (Class | null)[] = [];

        const rows = fetchResult.data.Rows;

        for(const lessonHour in rows) {
            const row = rows[lessonHour];
            const cl = row[Number(headerIndex) + 1];

            if(cl !== '') classes.push({
                lessonHour: Number(lessonHour),
                name: cl.replace(/<div><span class='[\w-]*'>/, '').replace(/<\/span>.*/, ''),
                startHour: row[0].split('<br />')[1],
                endHour: row[0].split('<br />')[2]
            }); else classes.push(null);
        }

        parsedData.days[headerIndex] = {
            name: header.Text.split('<br />')[0],
            date: header.Text.split('<br />')[1],
            classes
        }
    }

    const currentDay = parsedData.days[new Date().getDay() - 1];

    const currentDate = new Date().setFullYear(1970, 1, 1);

    let currentClass = 'None';

    for(const cls of currentDay.classes) {
        if(!cls) continue;
        const startDate = new Date(`1/1/1970 ${cls.startHour}`).getDate();
        const endDate = new Date(`1/1/1970 ${cls.endHour}`).getDate();

        if(currentDate >= startDate && currentDate < endDate) {
            currentClass = cls.name;
            break;
        }
    }

    if(verbose) console.log(JSON.stringify(
        currentDay,
        null,
        2
    ));

    console.log(currentClass);

    process.exit(0);
}