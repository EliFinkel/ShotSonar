const schedule = require('node-schedule');
var zipcodes = require('zipcodes');
const path = require('path');
var nodemailer = require('nodemailer');
var CronJob = require('cron').CronJob;



exports.stealthTest = (req,res) => {
    // puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

// That's it, the rest is puppeteer usage as normal 😊
puppeteer.launch({ headless: true }).then(async browser => {
  const page = await browser.newPage()
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
              /*await page.goBack();
              await page.waitForNavigation()
              await page.click('a[href = "/findcare/vaccination/covid-19/location-screening"]');
              await page.waitForNavigation();*/
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
  
  
  
  
