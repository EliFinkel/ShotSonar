const express = require('express');
const app = express();
const schedule = require('node-schedule');
var zipcodes = require('zipcodes');
const puppeteer = require('puppeteer');
const path = require('path');
var nodemailer = require('nodemailer');
const controller = require('./controllers/controller.js');
const routes = require('./routes/router.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/static', express.static('public'))


app.use('/', routes);


let port = process.env.PORT || 8080;
app.use(express.static(__dirname));
app.listen(port, () => {
    console.log("Server Started");
  
})

