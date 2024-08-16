import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const START_ID = 9190000;
const END_ID = 9200000;
const BASE_URL = 'https://app.joinhandshake.com/stu/jobs/';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loginToHandshake(page) {
    // Go to the login page
    await page.goto('https://app.joinhandshake.com/login');

    // Enter credentials manually and wait for 2 minutes
    console.log("Please log in manually. Waiting for 2 minutes...");
    await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000)); // 2 minutes wait time
}

async function processJob(page, jobId) {
    const jobUrl = `${BASE_URL}${jobId}`;
    await page.goto(jobUrl);

    // Check if the page contains "Cuseworks" and has an "Apply" button
    const hasCuseworks = await page.evaluate(() => {
        return document.body.textContent.toLowerCase().includes('cuseworks');
    });

    const hasApplyButton = await page.evaluate(() => {
        return [...document.querySelectorAll('span')].some(span => span.textContent === 'Apply');
    });

    if (hasCuseworks && hasApplyButton) {
        // Take a screenshot
        const screenshotPath = path.join(__dirname, `${jobId}.png`);
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot saved for job ID ${jobId} at ${screenshotPath}`);
    } else {
        console.log(`No screenshot for job ID ${jobId} - Cuseworks or Apply button not found`);
    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Set to true if you don't want the browser UI
    const page = await browser.newPage();

    // Log in to Handshake
    await loginToHandshake(page);

    // Process each job ID from start to end with a delay
    for (let jobId = START_ID; jobId <= END_ID; jobId++) {
        try {
            await processJob(page, jobId);

            // Add a 10-second delay before processing the next job
            await delay(10000); // 10 seconds = 10,000 milliseconds
        } catch (error) {
            console.error(`Error processing job ID ${jobId}:`, error);
        }
    }

    await browser.close();
})();
