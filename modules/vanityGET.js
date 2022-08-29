const express = require('express');

const router = express.Router();
const path = require('path');

//css
router.get('/style.css', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../style/`,`style.css`))
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
router.get('/user.svg', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../style/`,`user.svg`))
})
router.get('/door.svg', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../style/`,`logout_door.svg`))
})

//favicon
router.get('/favicon.ico', function(req,res){
    res.sendFile(path.join(`${__dirname}/`,'../style/favicon.ico'))
})

//javascript
router.get('/quiz.js', async function(req,res){
    res.sendFile(path.join(`${__dirname}/../misc/`,`quiz.js`))
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

module.exports = router
