const express = require('express');
const app = express();
const schedule = require('node-schedule');
var zipcodes = require('zipcodes');
const puppeteer = require('puppeteer');
const path = require('path');
var nodemailer = require('nodemailer');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/static', express.static('public'))






app.get('/test/:zip/:radius/:number', async (req,res) => {
    sendEmail(req.params.number, 'test send');

    const job = schedule.scheduleJob('*/5 * * * * *', async () => {
        
        console.log("😀");
        (async () => {
            
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
    
            await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening');
            var nearbyZips = zipcodes.radius(req.params.zip, req.params.radius);
            for(let i = 0; i < nearbyZips.length; i++){
                console.log(nearbyZips[i]);
                await page.$eval('input[name=text]', nearbyZips[i]);
        
                const form = await page.$('.btn');
                await form.evaluate( form => form.click() );
        
                await page.waitForSelector('p.fs16')
                let element = await page.$('p.fs16')
                let value = await page.evaluate(el => el.textContent, element)
                console.log(value);
                if(value != "Appointments unavailable"){
                    console.log("FOUND!!! 😀 😃 😄 😀 😃 😄 😀 😃 😄 😀 😃 😄")
                    console.log(`Go to ${nearbyZips[i]}`)
                    sendEmail(req.params.number, nearbyZips[i]);
                  //sendMessage(req.params.number, nearbyZips[i]);
              }
            }
            
    
            await browser.close();
        })();
    })
   
})




app.get('/', (req,res) => {
   res.render('index');
})


app.listen('8080', () => {
    console.log("Server Started");
  
})


async function sendMessage (email, zipcode){
  const accountSid = 'AC6a959999e04bc8aaf96addd6fb3033d5';
  const authToken = '3a1ecf374b93ebdc7001156b364af3e4';
  const client = require('twilio')(accountSid, authToken);
  
  client.messages
    .create({
       body: `Yay!! We found a vaccine at ${zipcode}.  Act fast and signup at walgreens`,
       from: '+14704357976',
       to: `+1${email}`
     })
    .then(message => console.log(message.sid));
 
}
    

function sendEmail(email, zipcode){
    let transport = nodemailer.createTransport({
        host: 'mailosaur.net',
        port: 2525,
        auth: {
           user: 'smooth-explanation@rqlfbr0h.mailosaur.net',
           pass: 'DbL9ftSZ'
        }
    });

    const message = {
        from: 'eligfinkel@gmail.com', // Sender address
        to: email,         // List of recipients
        subject: `We found a vaccine for you at ${zipcode}`, // Subject line
        text: `We found a vaccine for you at ${zipcode}` // Plain text body
    };
    transport.sendMail(message, function(err, info) {
        if (err) {
          console.log(err)
        } else {
          console.log(info);
        }
    });
}



