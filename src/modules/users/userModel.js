const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,   
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    faculty: {
        type: String,
        required: true,
        enum: ['Faculty Of Art', 'Faculty Of Science', 'Faculty Of Engineering', 'Faculty Of Social Sciences', 'Faculty Of Education'],
        default: 'select your faculty'

    },
    otp: {
        type: String,
        default: null
    },
    otpExpiery: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    }
},{timestamps:true});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel
