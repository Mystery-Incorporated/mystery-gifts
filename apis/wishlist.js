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

function decodeCookie(req) {
    let cookies = cookie.parse(req.headers.cookie);
    let token = cookies.token;
    let decoded = jwt.verify(token, process.env.SECRET);

    return {email: decode(decoded.emailHash), id: decode(decoded.hashedID)};
}

function addList(email, formData, callback) {

    formData.users = [email];

    Wishlist.findOne({id:formData.id}, (err, data) => {
        if (!data) {
            Wishlist.create(formData, callback);
        }
        else {
            return callback("Id already exists!", null);
        }
    });
    

}

module.exports = function(app) {

    app.get('/api/list/:id', withAuth, function(req, res) {

        let id = req.params.id;
        Wishlist.findOne({id:id}, (err, data) => {
            if (err || !data) {
                return res.status(400).json({ error: 1, msg: "Bad data, could not find list!" });
            }
            else {
                return res.status(200).json(data);
            }
        });
    });

    app.post('/api/list', withAuth, function(req, res) {
        let decoded = decodeCookie(req);
        let email = decoded.email;

        let formData = req.body;

        addList(email, formData, (err, data) => {

            if (err || !data) {
                return res.status(400).json({ error: 1, msg: "Bad data, could not create list!" });
            }
            else {
                return res.status(200).json({  msg: "Success" });
            }
        });
    });

    app.post('/api/list/wish', withAuth, function(req, res) {
        let decoded = decodeCookie(req);
        let email = decoded.email;

        let formData = req.body;

        findByEmail(email, (err, user) => {
            if (user) {
                Wishlist.updateOne({ id: formData.id }, { 
                    $push: {wishlist: {
                        url:formData.url,
                        tags: formData.tags,
                        title: formData.title,
                        maxCost: formData.maxCost
                    }},
                    $addToSet: {users:user.username}
                
                }, (err, data) => {

                    if (err || !data) {
                        return res.status(400).json({ error: 1, msg: "Bad data, could not add wish!" });
                    }
                    else {
                        return res.status(200).json({  msg: "Success" });
                    }
                });
            }
            else {
                return res.status(400).json({ error: 1, msg: "Bad data, you are not authorized, could not add wish!" });
            }
        });
    });

    app.delete('/api/list/:id', withAuth, function(req, res) {
        let decoded = decodeCookie(req);
        let email = decoded.email;

        let id = req.params.id

        Wishlist.find({id:formData.id}, (err, data) => {
            if (!data) {
                return res.status(400).json({ error: 1, msg: "Bad data, list doesnt exist!" });
            }
            else {
                if (data.users.includes(email)) {
                    Wishlist.remove({ is: is }, function(err, data) {
                        if (!err) {
                            return res.status(200).json({ msg: "Success!" });
                        }
                        else {
                            return res.status(400).json({ error: 1, msg: "Can not delete!" });
                        }
                    });
                }
                else {
                    return res.status(400).json({ error: 1, msg: "Unauthorized!" });
                }
            }
        });
    });

    app.delete('/api/list/:id/:itemId', withAuth, function(req, res) {
        let decoded = decodeCookie(req);
        let email = decoded.email;

        let id = req.params.id
        let itemId = req.params.itemId

        Wishlist.updateOne({ id: id}, { $pull: {wishlist: {_id: itemId}} }, (err, data) => {
            if (err || !data) {
                return res.status(400).json({ error: 1, msg: "Bad data, could not add wish!" });
            }
            else {
                return res.status(200).json({  msg: "Success" });
            }
        });
        
    });
    

};