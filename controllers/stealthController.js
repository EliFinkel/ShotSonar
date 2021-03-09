const schedule = require('node-schedule');
var zipcodes = require('zipcodes');
const path = require('path');
var nodemailer = require('nodemailer');
var CronJob = require('cron').CronJob;
const userModel = require('../models/user.js');
const Apify = require('apify');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const randomUA = require('modern-random-ua');


exports.stealthTest = (req,res) => {
    //Reular Puppeteer
    userModel.updateOne(
        { "email": req.params.email, "zipcode": req.params.zip}, // Filter
        {$set: {"status": 'running'}}, // Update
    ).then((obj) => {
    console.log('Status set to running');
    })
    .catch((err) => {
    console.log('Error: ' + err);
    })


    console.log(`Starting Test For ${req.params.email}`);
    var jobName = req.params.email;


    const job = schedule.scheduleJob(jobName, '*/1 * * * *', async () => {

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
            //'--proxy-server=172.67.181.145:80',
            `--window-size=1280,800`
        ]}).then(async browser => {
            const page = await browser.newPage();       
            await page.setUserAgent(randomUA.generate());
            
            //await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening');
            await page.goto('https://www.walgreens.com/');
        
            await page.click('img[src = "/images/adaptive/sp/brandstory_slot2.jpg"]')
            //await page.waitForNavigation();
       

            //await pasge.click('a[href="/findcare/vaccination/covid-19?ban=covid_vaccine_landing_schedule" role="button"]')
            const [el] = await page.$x('/html/body/main/div[1]/div/section/div/div[2]/div[6]/div[1]/a/span');
     
   
            await page.click('a[href = "/findcare/vaccination/covid-19/location-screening"]');
            //await page.waitForNavigation();



            var nearbyZips = zipcodes.radius(req.params.zip, req.params.radius);
            for(let i = 0; i < nearbyZips.length; i++){
                if(nearbyZips[i].length >= 5 && nearbyZips[i].charAt(0) == req.params.zip.charAt(0)){
                    console.log(nearbyZips[i]);

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
            findMinZips(workingZips, req.params.email, req.params.zip, nearbyZips);

            await page.close();
            await browser.close();
            await browser.disconnect; 
        });
    })
    res.redirect('/');
}



async function findMinZips(workingZips, email, zip, nearbyZips){
   // if(workingZips.length > (.1 * nearbyZips.length)){
    if(workingZips.length > 0){
        var minValues = [];
        for(let k = 0; k < 20; k++){
            // console.log('Loop' + i)
            var minValue = Number.MAX_VALUE;
            var closestZip;
            var closestIndex = 0;
            for(let j = 0; j < workingZips.length; j++){
                var currentValDist = zipcodes.distance(parseInt(zip), parseInt(workingZips[j]));
                if(currentValDist < minValue){
                    minValue = currentValDist;  
                    closestZip = workingZips[j];
                    closestIndex = j;  
                }
            }
            minValues.push(closestZip);
            console.log(minValue);
            workingZips.splice(closestIndex, 1);
        }
        console.log(`Working Zips Array Length:    ${workingZips.length}`);
        await sendEmail(email, minValues, workingZips.length);   

    }
}



  
async function sendEmail(email, zipcodes, arrayLength){
    // declare vars,
    var zipcodeString = ""
    for(var i = 0; i < zipcodes.length; i++){
        zipcodeString+="\n" + zipcodes[i] + ", \n";
    }
    let fromMail = 'ShotSonar@gmail.com';
    let toMail = `${email}` ;
    let subject = `Vaccines`;
    let text = `Yay!! We found vaccine appointments at ${zipcodeString}.  Please hurry as appointments fill up fast. Go to https://www.walgreens.com/findcare/vaccination/covid-19/location-screening`

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        //pool: true,
        auth: {
            user: fromMail,
            pass: 'shotSonar@123'
        }
    });
    let mailOptions = {
        from: fromMail,
        to: toMail,
        subject: subject,
        text: text
    };
    // send email
   await  transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.log(error);
        }
           // console.log(response)
           console.log("Email Sent ✅")
        });
    transporter.close();
}
  
  
  
  
