const express = require('express');
const app = express();
const schedule = require('node-schedule');
var zipcodes = require('zipcodes');
const puppeteer = require('puppeteer');
const path = require('path');
var nodemailer = require('nodemailer');
const controller = require('./controllers/controller.js');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/static', express.static('public'))






app.get('/test/:zip/:radius/:number', controller.runTest);

app.get('/sendEmail', controller.sendMail);



//app.get('/', (req,res) => {res.render('index');})


app.get('/', (req,res) => {res.render('newFrontend');})





app.listen('8080', () => {
    console.log("Server Started");
  
})

