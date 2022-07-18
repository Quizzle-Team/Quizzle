const path = require('path');
const fs = require('fs');
var logFile = fs.createWriteStream(path.join(`${__dirname}/`,'../log.txt'), {flags : 'a+'});

function maskHeaders(req,res,next){
    if (!res.headersSent)res.setHeader('X-Powered-By', 'Quiz-Server-V1.0.0');
    next();
}
function logger(req,res,next){
    clone = req.url;
    if (req.url.length > 500){
        clone = req.url.substring(0,200)+'...'
    }
    console.log(`[LOGGING] ${req.ip} ${req.method.toUpperCase()} ${clone}`);
    logFile.write(`\n[${new Date()}] ${req.ip} ${req.method.toUpperCase()} ${req.url}`);
    next();
}

module.exports = {
    maskHeaders,
    logger
}