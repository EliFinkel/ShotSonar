const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller.js');
const userController = require('../controllers/userController.js');

const stealthController = require('../controllers/stealthController');
router.get('/test/:zip/:radius/:email/', controller.runTest);



router.get('/realTime/:zip/:radius', controller.realTime);

router.get('/sendEmail', controller.sendMail); 
router.get('/stealth/:zip/:radius/:email/', stealthController.stealthTest);

router.get('/realTime', (req,res) => {res.render('realTimeInput.ejs');}) 

router.get('/cancel/:email', controller.endSearch);
router.get('/delete/:id', userController.deleteUser);

router.get('/addUser', (req,res) => { res.render('addNewUser')});
router.post('/addUser', userController.createNewUser);

router.get('/cancel', (req,res) => {res.render('cancelPage')});

//router.get('/', (req,res) => {res.render('index');})


router.get('/', userController.getllUsers);

module.exports = router;