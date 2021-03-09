var zipcodes = require('zipcodes');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const randomUA = require('modern-random-ua');

(async () => {

    console.log("Starting Job 🦺");
    var workingZips = [];
    puppeteer.use(StealthPlugin())
    puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
    puppeteer.launch({ headless: false, ignoreHTTPSErrors: true, args: 
        ['--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        //Slow Server
        //'--proxy-server=18.220.39.227:3128',
        '--proxy-server=p.webshare.io:80',
        `--window-size=1280,800`
    ]}).then(async browser => {
        const page = await browser.newPage();  
        await page.authenticate({
            username: 'zaabbbfs-US-rotate',
            password: '6adk02aw9ijf'
        });     
        await page.setDefaultNavigationTimeout(0); 
        await page.setUserAgent(randomUA.generate());
        
        //await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening');
        await page.goto('https://www.walgreens.com/');
    
        await page.click('img[src = "/images/adaptive/sp/brandstory_slot2.jpg"]')
        //await page.waitForNavigation({waitUntil: 'load'});
   
        console.log("Waited For Time")
        await page.waitForSelector('a[href="/findcare/vaccination/covid-19?ban=covid_vaccine_landing_schedule"]');
        await page.click('a[href="/findcare/vaccination/covid-19?ban=covid_vaccine_landing_schedule"]');
        //await page.waitForNavigation({waitUntil: 'load'});
        await page.waitForSelector('a[href = "/findcare/vaccination/covid-19/location-screening"]');
        await page.click('a[href = "/findcare/vaccination/covid-19/location-screening"]');
        //await page.waitForNavigation({waitUntil: 'load'});



        var nearbyZips = zipcodes.radius('60035', '50');
        for(let i = 0; i < nearbyZips.length; i++){
            if(nearbyZips[i].length >= 5 && nearbyZips[i].charAt(0) == '6'){
                console.log(nearbyZips[i]);

                await page.waitForSelector('input#inputLocation');
                await page.$eval('input#inputLocation', (el, value) => el.value = value, nearbyZips[i]);
                //await new Promise(r => setTimeout(r, 2000));
                await page.waitFor((Math.floor(Math.random() * 2) + 1) * 1000)
                await page.click('button[data-reactid="16"]');
                //await new Promise(r => setTimeout(r, 2000));
                await page.waitFor((Math.floor(Math.random() * 2) + 1) * 1000)
                let errorMsg = await page.$('span.input__error-text > strong');
                if(errorMsg != undefined){
                    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
                    nearbyZips.push(nearbyZips[i]);                
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
        //Sorting Algorithm Below
        //findMinZips(workingZips, req.params.email, req.paramss.zip, nearbyZips);

        await page.close();
        await browser.close();
        await browser.disconnect; 
    });
})();

