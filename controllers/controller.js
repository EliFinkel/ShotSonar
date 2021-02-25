const schedule = require('node-schedule');
var zipcodes = require('zipcodes');
const puppeteer = require('puppeteer');
const path = require('path');
var nodemailer = require('nodemailer');
const alert = require('alert'); 
var CronJob = require('cron').CronJob;
const axios = require('axios');
const { table } = require('console');


exports.runTest = async (req, res) => {
   // var testDist = getDist(61371);
    //console.log(testDist);
    var workingZips = [];
    console.log('Starting Test Soon');
    var jobName = req.params.email;
    const job = schedule.scheduleJob(jobName, '*/2 * * * *', async () => {
        const nearestWorkingZip = '';
        console.log("😀");
        (async () => { 
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening');
            var nearbyZips = zipcodes.radius(req.params.zip, req.params.radius);
            for(let i = 0; i < nearbyZips.length; i++){
                try{
                    if(nearbyZips[i].length >= 5){
                        console.log(nearbyZips[i]);
                        await page.$eval('input[name=text]', nearbyZips[i]);
                        const form = await page.$('.btn');
                        await form.evaluate( form => form.click() );
                        await page.waitForSelector('p.fs16')
                        let element = await page.$('p.fs16')
                        let value = await page.evaluate(el => el.textContent, element)
                        console.log(value);
                        if(value != "Appointments unavailable"){
                            console.log("FOUND!!! 😀 😃 😄 ")
                            console.log(`Go to ${nearbyZips[i]}`)
                            workingZips.push(nearbyZips);
                                                                                 
                    }       
                  }
                }catch(err){
                    console.log(err);
                }  
            }
            if(workingZips.length > 0){
                await sendEmail(req.params.email, workingZips);   
            }
            
            await browser.close();
        })();
    })
    res.redirect('/');
}



exports.endSearch =  async (req,res) => {  
        let currentJob = schedule.scheduledJobs[req.params.email];
        if(currentJob != null){
            await currentJob.cancel();

        }
        
        console.log(`[-] ${req.params.email}'s search was canceled`);
        res.redirect('/');
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
                if(nearbyZips[i].length >= 5){
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
    sendEmail('eli2finkel@gmail.com', testZips);
}

/*
function getDist(zip){
    var reqUrl = `http://www.zipcodeapi.com/rest/szy97PMG6ZZEUf7f0Yvwsq1kurNz8szkKMaQOmoQGI5ZfHEFMp3vdpxlrHNS2AnX/distance.json/60035/${zip}/miles`;

    axios.get(reqUrl)
    .then(response => {
        //console.log(response.data.url);
        //console.log(response.data.explanation);
        return JSON.parse(response).explanation;
    })
    .catch(error => {
        console.log(error);
    });
}*/




  
async function sendEmail(email, zipcodes){
    // declare vars,
    var zipcodeString = ""
    for(var i = 0; i < zipcodes.length; i++){
        zipcodeString+=zipcodes[i] + ", \n";
    }
    let fromMail = 'vaccinehunteralert@gmail.com';
    let toMail = `${email}, eligfinkel@gmail.com` ;
    let subject = `Vaccines`;
    let text = `Yay!! we found a vaccines at ${zipcodeString}.  Please hurry as appointment fill up fast. Go to https://www.walgreens.com/findcare/vaccination/covid-19/location-screening`

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        //pool: true,
        auth: {
            user: fromMail,
            pass: 'vaccineHunter123'
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
  
  
  
  