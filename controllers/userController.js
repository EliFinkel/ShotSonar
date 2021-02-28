
const userModel = require('../models/user.js');

exports.createNewUser = (req,res) => {
    let user = new userModel(
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            zipcode: req.body.zipcode,
            email: req.body.email,
        }
    );

    user.save(function (err) {
        if (err) {
            console.log(err);
            return err;
        }
        console.log('User Added');
        res.redirect('/');
      
    
    });
}


exports.getllUsers = async (req,res) => {
    const users = await userModel.find();
    res.render('userMainPage.ejs',{users} )
}


