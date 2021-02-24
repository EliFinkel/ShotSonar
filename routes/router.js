const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller.js');

router.get('/test/:zip/:radius/:email/', controller.runTest);


router.get('/realTime/:zip/:radius', controller.realTime);

router.get('/sendEmail', controller.sendMail); 


router.get('/realTime', (req,res) => {res.render('realTimeInput.ejs');}) 

router.get('/cancel/:email', controller.endSearch);


router.get('/cancel', (req,res) => {res.render('cancelPage')});

//router.get('/', (req,res) => {res.render('index');})


router.get('/', (req,res) => {res.render('newFrontend');})

module.exports = router;