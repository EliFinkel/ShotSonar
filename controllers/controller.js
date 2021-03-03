const schedule = require('node-schedule');
var zipcodes = require('zipcodes');
const puppeteer = require('puppeteer');
const path = require('path');
var nodemailer = require('nodemailer');
const alert = require('alert'); 
var CronJob = require('cron').CronJob;
const axios = require('axios');
const { table } = require('console');
const { min } = require('moment-timezone');
const userModel = require('../models/user.js');



exports.runTest = async (req, res) => {
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
        const browser = await puppeteer.launch({
            headless: false,
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/90.0.4403.0 Safari/537.36');
        
        await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19?ban=covid_vaccine_landing_schedule');
        await page.click('a[href = "/findcare/vaccination/covid-19/location-screening"]');
        await page.waitForNavigation();
       /* try{
            await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening');
        }
        catch(err){
            console.log('Error: ' + err)
        }*/
        
        
        var nearbyZips = zipcodes.radius(req.params.zip, req.params.radius);
        for(let i = 0; i < nearbyZips.length; i++){
            if(nearbyZips[i].length >= 5 && nearbyZips[i].charAt(0) == req.params.zip.charAt(0)){
                console.log(nearbyZips[i]);
              
                await page.$eval('input#inputLocation', (el, value) => el.value = value, nearbyZips[i]);
                await page.click('button[data-reactid="16"]');
                let errorMsg = await page.$('span.input__error-text > strong');
                if(errorMsg != undefined){
                    //await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
                    await page.goBack();
                    await page.waitForNavigation()
                    await page.click('a[href = "/findcare/vaccination/covid-19/location-screening"]');
                    await page.waitForNavigation();
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


exports.endSearch =  async (req,res) => {  
        let currentJob = schedule.scheduledJobs[req.params.email];
        if(currentJob != null){
            await currentJob.cancel();
            await userModel.updateOne(
                { "email": req.params.email}, // Filter
                {$set: {"status": 'stopped'}}, // Update
            ).then((obj) => {
             console.log('Status Set to Stopped');
            })
            .catch((err) => {
                console.log('Error: ' + err);
            })

           // res.redirect('/');
        }
        res.redirect('/');
        console.log(`[-] ${req.params.email}'s search was canceled`);
        
}



exports.realTime = async (req,res) => {
    let workingZips = [];
    (async () => { 
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening');
        var nearbyZips = zipcodes.radius(req.params.zip, req.params.radius);
        for(let i = 0; i < nearbyZips.length; i++){
            try{
                if(nearbyZips[i].length >= 5 && nearbyZips[i].charAt(0) == '6'){
                    //console.log(nearbyZips[i]);
                    await page.$eval('input[name=text]', nearbyZips[i]);
                    const form = await page.$('.btn');
                    await form.evaluate( form => form.click());
                    await page.waitForSelector('p.fs16')
                    let element = await page.$('p.fs16')
                    let value = await page.evaluate(el => el.textContent, element)
                    console.log(value);
                    if(value != "Appointments unavailable"){
                        //console.log("FOUND!!! 😀 😃 😄")
                      //  console.log(`Go to ${nearbyZips[i]}`)
                        workingZips.push(nearbyZips[i]);
                    }
                }
            }catch(err){
                console.log(err);
            }
        }
        await browser.close();
        if(workingZips.length > 0){
            
            
            alert(`There Are ${workingZips.length} working Zipcodes Taking Apointments within ${req.params.radius} miles of ${req.params.zip}`);
            await res.render('realTime', {workingZips});
        }
        else{
          alert(`There Are No Walgreens Taking Apointments within ${req.params.radius} miles of ${req.params.zip}`);
          await res.render('realTime', {workingZips: 'none'});
        }
    
           
    })();

         
}


var testZips = ['3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898','12345', '3345', '88898']
exports.sendMail = (req,res) => {
    sendEmail('shotsonar@gmail.com', testZips);
}


var apiKey = "JiTSowJGQ6ugvOglooK127JNOzOTzWhwpp8NtlkjLi9BEhd6JRKAKGMMmWVemWGg";
function getDist(zip, userZip){
    var dist = zipcodes.distance(parseInt(zip), parseInt(userZip));
    return dist;
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
  
  
  
  
