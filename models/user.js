const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let userSchema = new Schema({
    firstName: {type: String},

    lastName: {type: String},

    zipcode: {type: String},

    radius: {type: String, default: '50'},

    email: {type: String},
    
    status: {type: String, default: 'stopped'}

});


module.exports = mongoose.model('User', userSchema);
