/*var zipcodes = require('zipcodes');
const puppeteer = require('puppeteer');

(async () => {
    var nearbyZips = zipcodes.radius(60035, 50);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening');
   

    await page.$eval('input[name=text]', el => el.value = '19035');

    const form = await page.$('.btn');
    await form.evaluate( form => form.click() );

    await page.waitForSelector('p.fs16')
    let element = await page.$('p.fs16')
    let value = await page.evaluate(el => el.textContent, element)
    console.log(value);
    await browser.close();
})();*/



var zipcodes = require('zipcodes');
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening');
    var nearbyZips = zipcodes.radius(60035, 2000);
    for(let i = 0; i < nearbyZips.length; i++){
        if(nearbyZips[i] >= 5){
            console.log(nearbyZips[i]);
            await page.$eval('input[name=text]', nearbyZips[i]);
    
            const form = await page.$('.btn');
            await form.evaluate( form => form.click() );
        
            await page.waitForSelector('p.fs16')
            let element = await page.$('p.fs16')
            let value = await page.evaluate(el => el.textContent, element)
            console.log(value);
        }
      
    }
   
    await browser.close();
})();