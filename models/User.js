require('dotenv').config()
let mongoose = require('mongoose');
let Wishlist = require("./Wishlist");

let db = mongoose.connection;
db.once('open', () => console.log('connected to the database'));
// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Schema = mongoose.Schema;

/**
 * User Schema
 */
let userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,
        validate: /^[a-z0-9_-]+$/i
    },
    firstname: {
        type: String,
        required: true,
        unique: false
    },
    lastname: {
        type: String,
        required: true,
        unique: false
    },
    avatar: {
        type: String,
        required: false,
        unique: false,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    dob: {
        type: Date,
        required: true,
        unique: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Boolean,
        default: false
    },
    wishlist: {
        type:[
            new Schema({
                title: {
                    type: String,
                    required:true,
                    unique:false
                },
                url: {
                    type: String,
                    required: true,
                    unique: false
                },
                maxCost : {
                    type: Number,
                    required: true,
                    unique: false
                },
                tags: {
                    type: [String],
                    required: false,
                    default: []
                },
                complete: {
                    type: Boolean,
                    required: false,
                    default: false
                }
            })
        ],
        required:false,
        default: []
    }
},
{ timestamps: true });


module.exports = mongoose.model('User', userSchema);
