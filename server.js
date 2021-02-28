const express = require('express');
const app = express();
const schedule = require('node-schedule');
var zipcodes = require('zipcodes');
const puppeteer = require('puppeteer');
const path = require('path');
var nodemailer = require('nodemailer');
const controller = require('./controllers/controller.js');
const routes = require('./routes/router.js');
const bodyParser = require('body-parser');

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/static', express.static('public'))


app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use('/', routes);

// Set up mongoose connection
const mongoose = require('mongoose');

//mongoose.connect('mongodb+srv://eli:eli16821@card-qxsw8.mongodb.net/Tasks?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true  })
mongoose.connect('mongodb+srv://admin:adminPass@users.gkmdn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true  })
mongoose.Promise = global.Promise;

mongoose.set('useFindAndModify', false);


let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


let port = process.env.PORT || 8080;
app.use(express.static(__dirname));
app.listen(port, () => {
    console.log("Server Started");
  
})

