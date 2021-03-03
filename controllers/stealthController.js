const schedule = require('node-schedule');
var zipcodes = require('zipcodes');
const path = require('path');
var nodemailer = require('nodemailer');
var CronJob = require('cron').CronJob;
const userModel = require('../models/user.js');


exports.stealthTest = (req,res) => {
    const puppeteer = require('puppeteer-extra')

    const StealthPlugin = require('puppeteer-extra-plugin-stealth')

    puppeteer.use(StealthPlugin())

    const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')

    puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
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


    const job = schedule.scheduleJob(jobName, '*/2 * * * *', async () => {

        console.log("Starting Job 🦺");
        var workingZips = [];
        puppeteer.launch({ headless: true }).then(async browser => {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/90.0.4403.0 Safari/537.36');
    
            await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening');



            var nearbyZips = zipcodes.radius(req.params.zip, req.params.radius);
            for(let i = 0; i < nearbyZips.length; i++){
            if(nearbyZips[i].length >= 5 && nearbyZips[i].charAt(0) == req.params.zip.charAt(0)){
            console.log(nearbyZips[i]);

            await page.$eval('input#inputLocation', (el, value) => el.value = value, nearbyZips[i]);
            await page.click('button[data-reactid="16"]');
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
  
  
  
  