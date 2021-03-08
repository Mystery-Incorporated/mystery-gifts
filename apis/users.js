require('dotenv').config()

let Users = require("../models/User");
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

function createSession(req, res, data) {
    let payload = {
        // hashedID: encode(identifier),
        hashedID: encode(data.username),
        emailHash: encode(data.email),
        // hashedPlayerNickName: encode(data.playerNickName),
        // hashedVerified: encode(data.verified),
        // hashedPassword: data.isGuest ? encode(data.password) : null
    }
    const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: 60*60*100
    });
    
    findByUsername(data.username, function(err, data) {

        return res.cookie('token', token, { httpOnly: true }).status(200).json({
            firstname: data.firstname,
            lastname: data.lastname,
            username: data.username,
            avatar: data.avatar,
            verified: data.verified,
            wishlist: data.wishlist,
            dob: data.dob
        });        
    });
}

function killSession(req, res) {
    return res.clearCookie("token").status(200).json({success:true});;
}

function login(err, data, password, req, res) {
    if (!err && data) {
        let user = {
            username: data.username,
            email: data.email,
            // playerNickName: data.playerNickName,
            // verified: data.verified
        };
        if (verifyPass(data, password)) return createSession(req, res, user);
        else res.status(400).json({ error: 0, msg: "Incorrect Password" });
    } 
    else return res.status(400).json({ error: 1, msg: "Email does not exists" });
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

function createUser(data, callback) {
    let salt = bcrypt.genSaltSync(15);
    let pass = bcrypt.hashSync(data.password, salt);
    let user = {
        email: data.email,
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        username: data.username,
        avatar: data.avatar,
        dob: data.dob,
        password: pass
    };
    Users.create(user, callback);
}

function updateUserInfo(email, data, callback) {
    if (data.password){
        let salt = bcrypt.genSaltSync(15);
        let pass = bcrypt.hashSync(data.password, salt);
        data.password = pass;
    }

    Users.updateOne({ email: email }, { $set: data }, callback);
}

function resetPass(email, formData, callback) {
    findByEmail(email, (err, data) => {
        if (data) {
            if (verifyPass(data, formData.currentpassword)) {

                let user = {
                    email: data.email,
                    username: data.username,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    username: data.username,
                    avatar: data.avatar,
                    dob: data.dob,
                    wishlist: data.wishlist,
                    password: formData.password,
                    verified: true
                };
                return updateUserInfo(email, user, callback);
            } 
            else {
                return callback("Incorrect Password!", null);
            }
        }
        else {
            return callback("Invalid Email!", null);
        }
    });
}

function decodeCookie(req) {
    let cookies = cookie.parse(req.headers.cookie);
    let token = cookies.token;
    let decoded = jwt.verify(token, process.env.SECRET);

    return {email: decode(decoded.emailHash), id: decode(decoded.hashedID)};
}

function addWish(email, formData, callback) {

    Users.updateOne({ email: email }, { $push: {wishlist: {
        url:formData.url,
        tags: formData.tags,
        title: formData.title,
        maxCost: formData.maxCost
    }} }, callback);

}

module.exports = function(app) {

    ///// DISABLED
    app.post('/api/signup', withAuth, (req, res) => {
        let formData = req.body;
        if (!formData.email || !formData.username || !formData.password || !formData.firstname || !formData.lastname || !formData.dob) {
            return res.status(400).json({ error: 1, msg: "Missing fields." });
        }
        else {
            findByEmail(formData.email, (err, data) => {
                if (err || !data) {
                    // email doesn't exist we are good
                    findByUsername(formData.username, (err, data) => {
                        if (err || !data) {
                            // tag doesn't exist we are good
                            createUser(formData, (err, data) => {
                                if (err) {
                                    let errType = err.name;
                                    if (errType === 'ValidationError') {
                                        // go through each error ( there will only be one but still)
                                        let msg = ""
                                        let validationErrors = err.errors;
                                        for (let error in validationErrors) {
                                            if (validationErrors[error].kind === 'minlength') {
                                                msg += 'Username needs to be atleast 4 characters long. '
                                            } else {
                                                msg += 'Username cannot contain any special symbols other than _ or -. '
                                            }
                                        }
                                        return res.status(400).json({error: err, msg:msg});
                                    } else {
                                        return res.status(400).json({error: err, msg:"Failed to create user."});
                                    }
                                } else {
                                    return res.status(200).json({ data });
                                }
                            });
                        } 
                        else {
                            return res.status(400).json({ error: 1, msg: "Username exists" });
                        }
                    });
                } 
                else {
                    return res.status(400).json({ error: 1, msg: "Email exists" });
                }
                
            });
        }
        
    });


    app.post('/api/signout', (req, res) => {
        // delete player associated with this user
        return killSession(req, res);
    });

    app.post('/api/signin', (req, res) => {
        const formData = req.body;
        if (!formData.email || !formData.password) {
            return res.status(400).json({ error: 1, msg: "Missing fields." });
        }
        else {
            findByEmail(formData.email, (err, data) => {
                return login(err, data, formData.password, req, res);
            });
        }
    });    

    app.post('/api/reset', withAuth, (req, res) => {
        let decoded = decodeCookie(req);

        const formData = req.body;
        if (!formData.currentpassword || !formData.password || !formData.password2) {
            return res.status(400).json({ error: 1, msg: "Missing fields." });
        }
        else {
            resetPass(decoded.email, formData, (err, data) => {
                if (err) {
                    return res.status(400).json({ err: err });
                }
                else {
                    return res.status(200).json({ data: "Success!" });
                }
            });
        }
    });

    app.get('/api/checkToken', withAuth, function(req, res) {
        let decoded = decodeCookie(req);

        findByEmail(decoded.email, function(err, data) {

            return res.status(200).json({
                firstname: data.firstname,
                lastname: data.lastname,
                username: data.username,
                avatar: data.avatar,
                verified: data.verified,
                wishlist: data.wishlist,
                dob: data.dob
            });
        });
    });

    app.get('/api/users', withAuth, function(req, res) {
        let decoded = decodeCookie(req);

        Users.find({$query: {email:{$ne: decoded.email}}, $orderby: { firstname : 1 }}).select(["firstname", "lastname", "email", "avatar", "dob", "username", "wishlist"]).exec((err, data) => {
            if (data) {
                return res.status(200).json({ members: data });
            }
            else {
                return res.status(200).json({ members: [] });
            }
        });
    });

    app.get('/api/users/:user', withAuth, function(req, res) {
        let user = req.params.user;

        findByUsername(user, (err, data) => {
            if (err || !data) {
                return res.status(404).json({ error: 1, msg: "Could not find user!" });
            }
            else {
                let result = {
                    firstname: data.firstname,
                    lastname: data.lastname,
                    username: data.username,
                    avatar: data.avatar,
                    verified: data.verified,
                    wishlist: data.wishlist,
                    dob: data.dob
                };
                return res.status(200).json({ data: result });
            }
        });
    });

    app.post('/api/users/update', withAuth, function(req, res) {
        let decoded = decodeCookie(req);
        let email = decoded.email;

        let formData = req.body;

        updateUserInfo(email, formData, (err, data) => {
            if (err || !data) {
                return res.status(500).json({ error: 1, msg: "Could not update user!" });
            }
            else {
                return res.status(200).json({  username: formData.username });
            }
        });
    });


    app.get('/api/wish', withAuth, function(req, res) {
        let decoded = decodeCookie(req);
        let email = decoded.email;

        let formData = req.body;

        findByEmail(email, (err, data) => {
            if (err || !data) {
                return res.status(400).json({ error: 1, msg: "Bad data, could not add wish!" });
            }
            else {
                return res.status(200).json({  wishlist: data.wishlist });
            }
        });
    });

    app.get('/api/wish/:email', withAuth, function(req, res) {

        let email = req.params.email;
        findByEmail(email, (err, data) => {
            if (err || !data) {
                return res.status(400).json({ error: 1, msg: "Bad data, could not add wish!" });
            }
            else {
                return res.status(200).json({  wishlist: data.wishlist });
            }
        });
    });

    app.post('/api/wish', withAuth, function(req, res) {
        let decoded = decodeCookie(req);
        let email = decoded.email;

        let formData = req.body;

        addWish(email, formData, (err, data) => {
            if (err || !data) {
                return res.status(400).json({ error: 1, msg: "Bad data, could not add wish!" });
            }
            else {
                return res.status(200).json({  msg: "Success" });
            }
        });
    });

    app.delete('/api/wish/:id', withAuth, function(req, res) {
        let decoded = decodeCookie(req);
        let email = decoded.email;

        let id = req.params.id

        Users.updateOne({ email: email }, { $pull: {wishlist: {_id: id}} }, (err, data) => {
            if (err || !data) {
                return res.status(400).json({ error: 1, msg: "Bad data, could not add wish!" });
            }
            else {
                return res.status(200).json({  msg: "Success" });
            }
        });
    });

    // app.post('/api/sendVerification', (req, res) => {
    //     let decoded = decodeCookie(req);
    //     let email = decoded.email;

    //     sendEmail(email, generateVerificationToken(email), req, res);

    //     return res.status(200).json({ msg: 'success' });
    // });

    app.post('/api/verifyEmail/:token', (req, res) => {

        if (!req.params.token) return res.status(400).json({ error: 1, msg: "Token expired or Invalid token!" });

        let data = Buffer(req.params.token, 'base64').toString('ascii').split("/");

        if (verificationTokenValid(data[1], req.params.token)) {
            verifyEmail(data[1], (err, data) => {
                if (err) {
                    return res.status(500).json({ error: 1, msg: "Could not verify email!" });
                }
                else {
                    return res.status(200).json({ msg: data.msg }); 
                }
            });
        }
        else {

            return res.status(400).json({ error: 1, msg: "Token expired or Invalid token!" });
        }
    });

};