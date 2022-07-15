//npm imports 
const express = require("express");
const fs = require("fs");
const jsearch = require("js-search")
const ejs = require('ejs')
const ws = require("ws")
const cookieParser = require('cookie-parser')
const path = require('path');
const jwt = require('jsonwebtoken')


//Local Imports
const miscRouting = require('./../modules/vanityGET.js')
const authenticate = require('./../modules/authentication.js')
const misc = require('./../modules/misc.js') 
const serverFunctions = require('./../modules/serverFunctions.js')

module.exports = {
    jwt,
    express,
    fs,
    jsearch,
    ejs,
    ws,
    miscRouting,
    authenticate,
    misc,
    path,
    middleWare: [
        miscRouting, express.urlencoded({extended:true}),cookieParser(), serverFunctions.logger,serverFunctions.maskHeaders
    ]
}