const express = require('express');

const router = express.Router();
const path = require('path');

//css
router.get('/style.css', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../style/`,`style.css`))
})
router.get('/tables.css', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../style/`,`tables.css`))
})
router.get('/index.css', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../style/`,`index.css`))
})

//mp3
router.get('/ding.mp3', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../misc/`,`ding.mp3`))
})

//svg
router.get('/trash.svg',async function(req,res){
    res.sendFile(path.join(`${__dirname}/../style/`,`trash.svg`))
})
router.get('/close.svg', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../style/`,`close.svg`))
})
router.get('/x.svg', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../style/`,`x.svg`))
})
router.get('/pencil.svg', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../style/`,`pencil.svg`))
})


//favicon
router.get('/favicon.svg', function(req,res){
    return res.sendFile(path.join(`${__dirname}/`,'../style/logo.svg'))
})

//javascript
router.get('/quiz.js', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../misc/`,`quiz.js`))
})
router.get('/tableFill.js', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../misc/`,`tableFill.js`))
})
router.get('/quizmaker.js', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../misc/`,`quizmaker.js`))
})
router.get('/menu.js', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../misc/`,`menu.js`))
})
router.get('/ejs.min.js', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../misc/`,`ejs.min.js`))
})
router.get('/papaparse.min.js', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../misc/`,`papaparse.min.js`))
})

module.exports = router
