const schedule = require('node-schedule');
var zipcodes = require('zipcodes');
const puppeteer = require('puppeteer');
const path = require('path');
var nodemailer = require('nodemailer');
const alert = require('alert'); 
var CronJob = require('cron').CronJob;
const axios = require('axios');


exports.runTest = async (req, res) => {
   // var testDist = getDist(61371);
    //console.log(testDist);
    var workingZips = [];
    console.log('Starting Test Soon');
    //Test Email
    //await sendEmail(req.params.email, 'test');    
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
                            //await sendMessage(req.params.number, nearbyZips[i]);
                                 
                                                                                 
                    }       
                  }
                }catch(err){
                    console.log(err);
                }  
            }
            await sendEmail(req.params.email, workingZips);   
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
                       // workingZips.push(nearbyZips[i]);
                    }
                }
            }catch(err){
                console.log(err);
            }
        }
        await browser.close();
        if(workingZips.length > 0){
            console.log(workingZips)
            alert(`There Are ${workingZips.length} working Zipcodes Taking Apointments within ${req.params.radius} miles of ${req.params.zip}`);
            await res.render('realTime', {workingZips});
        }
        else{
          alert(`There Are No Walgreens Taking Apointments within ${req.params.radius} miles of ${req.params.zip}`);
          await res.render('realTime', {zipcodes: 'none'});
        }
    
           
    })();

 



         
}

exports.sendMail = (req,res) => {
    sendEmail('eligfinkel@gmail.com', "60035");
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




/*
async function sendMessage (phone, zipcode){
    const accountSid = 'ACe4bd948b994e6f4818ac7a6dd12bb32c';
    const authToken = '9fc5aa06e51bf5bb3d810fd29e7669ce';
    const client = require('twilio')(accountSid, authToken);
    
    client.messages
      .create({
         body: `Yay!! we found a vaccine at ${zipcode}.  Please hurry as appointment fill up fast. Go to https://www.walgreens.com/findcare/vaccination/covid-19/location-screening`,
         from: '+14693366144',
         to: `+1${phone}`
       })
      .then(message => console.log(message.sid));
   
  }
      
*/



  
async function sendEmail(email, zipcodes){
    // declare vars,
    var zipcodeString = ""
    for(var i = 0; i < zipcodes.length; i++){
        zipcodeString+=zipcodes[i] + ", ";
    }
    let fromMail = 'vaccinehunteralert@gmail.com';
    let toMail = email;
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
            console.log(response)
        });
    transporter.close();
}
  
  
  
  