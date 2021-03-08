require('dotenv').config()
let mongoose = require('mongoose');

let db = mongoose.connection;
db.once('open', () => console.log('connected to the database'));
// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Schema = mongoose.Schema;

/**
 * User Schema
 */
let wlSchema = new Schema({
    users: {
        type: [String],
        required: true,
        default: []
    },
    title: {
        type: String,
        require: true
    },
    id: {
        type: String,
        require: true
    },
    wishlist: {
        type: [
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


module.exports = mongoose.model('Wishlist', wlSchema);
