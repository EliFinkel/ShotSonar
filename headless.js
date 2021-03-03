const puppeteer = require('puppeteer');

(async () => {
        const browser = await puppeteer.launch();

        console.log(await browser.userAgent());

        await browser.close();
})();