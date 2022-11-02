//npm imports 
const express = require("express");
const fs = require("fs");
const ejs = require('ejs')
const ws = require("ws")
const cookieParser = require('cookie-parser')
const path = require('path');


//Local Imports
const miscRouting = require('./../modules/vanityGET.js')
const misc = require('./../modules/misc.js') 
const serverFunctions = require('./../modules/serverFunctions.js')

module.exports = {
    express,
    fs,
    ejs,
    ws,
    miscRouting,
    misc,
    path,
    middleWare: [
        miscRouting, express.urlencoded({extended:true}),cookieParser(), serverFunctions.logger,serverFunctions.maskHeaders
    ]
}