var zipcodes = require('zipcodes');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

/*
(async () => {

    puppeteer.use(StealthPlugin())
    puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
    var workingZips = [];
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();
 
    //page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening');

    var nearbyZips = zipcodes.radius(60035, 50);
    for(let i = 0; i < nearbyZips.length; i++){
        if(nearbyZips[i].length >= 5 && nearbyZips[i].charAt(0) == '6'){
            console.log(nearbyZips[i]);
          
            await page.$eval('input#inputLocation', (el, value) => el.value = value, nearbyZips[i]);
            await page.click('button[data-reactid="16"]');
            let errorMsg = await page.$('span.input__error-text > strong');
            if(errorMsg != undefined){
                await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
                    
                continue;
            }
         

            await page.waitForSelector('p.fs16', {  visible: true , timeout: 0 });
            let element = await page.$('p.fs16');
            let value = await page.evaluate(el => el.textContent, element); 
            console.log(value);
            if(value == "Appointments available!"){
                console.log("FOUND!!!✔️");
                workingZips.push(nearbyZips[i]);
            } 
        }
    }
    await browser.close();
})();*/

const Apify = require('apify');
const randomUA = require('modern-random-ua');

Apify.main(async () => {
     // Set one random modern user agent for entire browser
    const browser = await Apify.launchPuppeteer({
        userAgent: randomUA.generate(),
    });
    const page = await browser.newPage();
    // Or you can set user agent for specific page
    await page.setUserAgent(randomUA.generate());
  

    // And work on your code here
    await page.close();
    await browser.close();
});