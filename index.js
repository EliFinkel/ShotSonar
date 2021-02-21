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
    sendMessage(req.params.number, req.params.zip);

    const job = schedule.scheduleJob('*/5 * * * * *', async () => {
        console.log("😀");
        (async () => {
            
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
    
            await page.goto('https://www.walgreens.com/findcare/vaccination/covid-19/location-screening');
            var nearbyZips = zipcodes.radius(req.params.zip, req.params.radius);
            for(let i = 0; i < nearbyZips.length; i++){
                
                await page.$eval('input[name=text]', nearbyZips[i]);
        
                const form = await page.$('.btn');
                await form.evaluate( form => form.click() );
        
                await page.waitForSelector('p.fs16')
                let element = await page.$('p.fs16')
                let value = await page.evaluate(el => el.textContent, element)
                console.log(value);
                //if(value != "Appointments unavailable"){
                // sendMessage(req.params.number)
            //  }
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

      let testAccount = await nodemailer.createTestAccount();

      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      let info = await transporter.sendMail({
        from: 'Covid Vaccine Alert', // sender address
        to: email, // list of receivers
        subject: "Vaccine Found!", // Subject line
        text: `The walgreens at ${zipcode} is now taking apointments! Please hurry`, // plain text body
        html: "<b>Hello world?</b>", // html body
      });
    
      console.log("Message sent: %s", info.messageId);

      
    }
    
  

