require('dotenv').config()

let Users = require("../models/User");
let Wishlist = require("../models/Wishlist");
const withAuth = require('./middleware');
const bcrypt = require('bcryptjs');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET);
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
let cookie = require('cookie');
const cryptoRandomString = require('crypto-random-string');
const User = require('../models/User');

function encode(email) {
    if (!email) return "";
    return cryptr.encrypt(email);
}

function decode(email) {
    if (!email) return "";
    return cryptr.decrypt(email);
}

function verifyPass(data, password) {
    if (!data || !password) return false;
    return bcrypt.compareSync(password, data.password);;
}

function findByEmail(email, callback) {
    Users.findOne({email: email}, callback);
}

function findByUsername(tag, callback) {
    Users.findOne({username: tag}, callback);
}

function getAll(callback) {
    Users.find({}, callback);
}

function verifyEmail(email, callback) {
    Users.findOne({email: email}, (err, data) => {
        if (err | data) {
            callback(null, {msg: "Email not found!"});
        }
        else {
            if (data.verified){
                callback(null, {msg: "Email already verified!"});
            }
            else {
                Users.updateOne({ email: email }, { $set: { verified: true } }, callback);
            }
        }
    });
    
}

function generateVerificationToken(email) {
    let date = new Date();
    let toEncode = "verification/"+email+"/"+date;
    return Buffer(toEncode, 'ascii').toString('base64');
}

function verificationTokenValid(email, token) {
    if (!token) return false;

    let data = Buffer(token, 'base64').toString('ascii').split("/");
    if (data.length != 3) {
        return false;
    }
    else {
        return (email === data[1] && Math.ceil((new Date() - new Date(data[2])) / (1000*60*60)) <= 72);
    }
}

function sendEmail(email, token, req, res) {
    let transporter = nodemailer.createTransport({ 
        service: 'gmail', 
        auth: { 
            user: process.env.MAIL_USER, 
            pass: process.env.MAIL_PASS 
        } 
    });

    let mailOptions = { 
        from: 'no-reply@shgang.com', 
        to: email, 
        subject: 'Account Verification Token', 
        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/verify\/?token=' + token + '\n\nBest,\nMystery Inc\n' 
    };

    transporter.sendMail(mailOptions, function (err) {
        if (err) { console.log(err); }
    });
}

function decodeCookie(req) {
    let cookies = cookie.parse(req.headers.cookie);
    let token = cookies.token;
    let decoded = jwt.verify(token, process.env.SECRET);

    return {email: decode(decoded.emailHash), id: decode(decoded.hashedID)};
}

function changeUserPass(user, pass, callback) {
    let salt = bcrypt.genSaltSync(15);
    let passHash = bcrypt.hashSync(pass, salt);

    Users.updateOne({email: user.email}, {$set: {password: passHash}}, callback);
}

function remind(user) {

    let pass = cryptoRandomString({length: 10});

    changeUserPass(user, pass, (err, data) => {
        if (!err) {
            let transporter = nodemailer.createTransport({ 
                service: 'gmail', 
                auth: { 
                    user: process.env.MAIL_USER, 
                    pass: process.env.MAIL_PASS 
                } 
            });
        
            let mailOptions = { 
                from: 'no-reply@' + process.env.MAIN_HOST, 
                to: user.email, 
                subject: 'Mystery Inc Gifts: Welcome reminder.', 
                text: 'Hey ' + user.firstname + ',\n\n' + 
                'Welcome to Mystery Inc Gifts, a easily manageable public wish list system for members. \n\n' + 
                'Please find your login information for the application below. You can login at http:\/\/' + process.env.APP_HOST + '\n\n' +
                '\tlogin: ' + user.email + '\n' + 
                '\tpass: ' + pass + '\n' + 
                'For first time login, you will be promped to reset your password.\n\n' +
                'Please report any bugs or concerns to https://github.com/Mystery-Incorporated/mystery-gifts/issues\n\n' + 
                '<img src="https://raw.githubusercontent.com/Mystery-Incorporated/mystery-incorporated.github.io/main/media/icon.jpg" />\n\n' +
                'Best,\nMystery-Inc' 
            };
        
            transporter.sendMail(mailOptions, function (err) {
                if (err) { console.log(err); }
            });
        }
    });
}

function remindUnverified(callback) {

    Users.find({verified:false}, (err, data) => {

        if (data) {
            data.forEach(user => {
                remind(user);
            }); 
        }
        
        callback(err, data);
    });
}

function remindSpecific(email, callback) {

    Users.findOne({email:email}, (err, data) => {

        if (data) {

            remind(data);

        }
        
        callback(err, data);
    });
}

module.exports = function(app) {
    
    app.post('/admin/remind/unverified', (req, res) => {
        let decoded = decodeCookie(req);

        function callback(err, data) {
            if (err) {
                return res.status(400).json({ err: "Could not remind unverified users." });
            }
            else {
                return res.status(200).json({ data: "Success! reminded." });
            }
        }
        

        console.log(req.body);
        findByEmail(decoded.email, (err, data) => {
            if (data && data.admin) {
                if (req.body.email) {
                    remindSpecific(req.body.email, callback)
                }
                else {
                    remindUnverified(callback);
                }
                
            }
            else {
                return res.status(400).json({ err: "Unauthorized!" });
            }
        });
    });
};