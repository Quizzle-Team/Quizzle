//IMPORTS
const imports = require("./imports.js")
keys = (Object.keys(imports))
keys.forEach(key => {global [key] = imports[key]}) //im a genius!!!

const express = require('express')
const authenticate = require("../modules/authentication.js")
const { fs, path } = require("./imports.js")
const { base64dec, hash, clean } = require("../modules/misc.js")
const res = require("express/lib/response")
const app = express();

app.use(imports.middleWare) //i know i added it as a global variable but this is a cleaner way of showing it
app.set('render engine','ejs')

fileHandlers = []

var port = 5001;
var host = '0.0.0.0'

var WServer = new ws.Server({
    port:"8000",
    path : "/quizSocket",
});


app.get('/', function(req,res){    
    res.render('index.ejs')
})

app.get('/admin/', function(req,res){ 
    if (req.cookies.auth){
        auth = clean(req.cookies.auth)

        uname = base64dec(auth.split(':')[0])
        password = base64dec(auth.split(':')[1])
        console.log("/admin/ says uname: "+uname+" password: "+password)
        if (authenticate(uname, hash(password))){
            if (uname=="admin"){
                console.log("uname is admin")
                return res.render('adminPanel.ejs')
            }
            return res.redirect('/teacher/')
        }
    }
    res.redirect('/signIn/')
})

app.get('/makeQuiz', function(req,res){
	auth = clean(req.cookies.auth)

        uname = base64dec(auth.split(':')[0])
        password = base64dec(auth.split(':')[1])

        if (authenticate(uname, hash(password))){
		return res.render('quizmaker.ejs');
	}
})

app.get('/teacher/', function(req,res){
    if (req.cookies.auth){
        auth = clean(req.cookies.auth)

        uname = base64dec(auth.split(':')[0])
        password = base64dec(auth.split(':')[1])

        console.log(password)
        
        if (authenticate(uname, hash(password))){
            if (uname == "admin"){
                return res.redirect('/admin/')
            }
            return res.render("teacherPanel.ejs")
        }
    }
    res.redirect('/signIn/')
})


app.get('/signIn/', function(req,res){
    if (req.cookies.auth){
        auth = clean(req.cookies.auth).split(':')
        username = base64dec(auth[0])
        password = base64dec(auth[1])

        console.log("signIn/ says uname: "+username+" password: "+password)
        username=='admin' ? res.redirect('/admin/') : res.redirect('/teacher/');
        return;
    }
    res.render('signIn.ejs')
})

app.get('/logout', function(req,res){
    res.clearCookie('auth')
    res.redirect('/signIn/')
});

app.post('/signIn/', function(req,res){
    if (req.body.password && req.body.username){
        username = clean(req.body.username);
        password = clean(req.body.password);
        const givenHash = misc.hash(password)
        console.log(givenHash);
        if (authenticate(username, givenHash)){
            //expire cookie in 1 day
            res.cookie('auth', misc.base64enc(username)+":"+ misc.base64enc(password), {maxAge: 86400000, httpOnly: true, sameSite: "strict"})

            username=='admin' ? res.redirect('/admin/') : res.redirect('/teacher/');
        }
        
        else {
            data = {
                error:"401 - Unauthorized",
                description:"Invalid authentication"
            }
            return res.render("error.ejs", data)
        }

        
    }
    
})


/*
document.querySelectorAll('h4 > a').forEach(result =>{
    window.deleteIcon = document.createElement('img')
    deleteIcon.setAttribute('src','trash.svg')
    result.appendChild(deleteIcon)
})
*/

app.post('/removeQuiz', function(req,res){

    req.cookies.auth == undefined ? auth = [req.body.username, req.body.password] : auth = req.cookies.auth.split(':')

    if (!req.body.username && !req.body.password){
        if (req.cookies.auth == undefined){ //yes i can shove it into one if statement but this way is more readable for me
            return res.status(401).send("No authorization given")
        }
    }

    const {username, pass} = auth
    
    username = misc.base64dec(username)
    pass = misc.base64dec(pass)

    if (!authenticate(username, hash(pass))){
        res.clearCookie('auth')
        return res.status(401).send("unauthorized")
    }

    if (req.body.id){
        fs.readFile(`${__dirname}/../quiz/data.json`, 'utf8', function(err, data){
            if (err){
                console.log(err)
                return res.status(500).send("Internal server error")
            }
            data = JSON.parse(data)
            selectedQuiz = c.filter(function(dat){
                return (dat['url']==`/quiz/${req.body.id}`)
            })[0]

            if (!selectedQuiz){
                return res.status(404).send("Quiz not found")
            }

            if (selectedQuiz['createdBy'] != username){
                return res.status(401).send("Unauthorized")
            }

            delete data[data.indexOf(selectedQuiz)]

            
            fs.writeFile(`${__dirname}/../quiz/data.json`, JSON.stringify(data), function(err){
                if (err){
                    console.log(err)
                    return res.status(500).send("Internal server error")
                }
                
            })
            fs.unlink(path.join(`${__dirname}/../quiz/`,`${req.body.id}.json`), function(err){
                if (err){
                    console.log(err)
                }
                return res.send('success')
            })

        })
    }
    else {
        return res.status(400).send("No id given")
    }
})



app.get('/search', async function(req,res){
    if (req.query.search == undefined){
        console.log('No data')
        data = {
            error:"400 - Bad Request",
            description:"Search parameter not fulfilled"
        }
        res.status(400)
        return res.render('error.ejs', data)
    }


    else { //valid data

        let search = req.query.search; 
        typeof search=='object' ? search = search[0] : null; //HPP prevention, otherwise it'll crash when /search?search=hi&search=bye


        let query = new jsearch.Search('keywords')
        query.addIndex('keywords')
        query.addIndex('name')
        rdata = fs.readFile(path.join(`${__dirname}/../`,`quiz/data.json`), function (err, data) {
            if (err) return res.render('error.ejs', {error:"Something went wonky.", description:err});
            data = JSON.parse(data.toString());
            query.addDocuments(data)
            let results = query.search(search)
            let resList = Object.keys(results)
            let htmlCollection =""
            template = `
            <h4><a href="<%=url%>"><%=name%></a></h4>
            <p class="description"><%=description%></p>
            `

            
            resList.forEach(element => {
                let desc = results[element].description
                let squery = results[element].name
                let url = results[element].url

                htmlCollection+=ejs.render(template, {url:url, description:desc, name:squery})
            });

            if (htmlCollection ==""){
                htmlCollection = `<h2>!No results!</h2>`
            }
            res.render('results.ejs', {query:search, results:htmlCollection})
        });
    }
})






app.get('/quiz/:quiz', async function(req,res){
    let quiz = req.params.quiz
    console.log(quiz.match('/'))
    
    if (quiz.match("/") != null || quiz.match("\\.\\.")  != null || quiz.match("%2F")  != null || quiz.match("%2E%2E") !=null ){
        return res.render('error.ejs', {error:"why", description:"you know what you did"})
    }
    else if (quiz == "data"){
        return res.render('error.ejs', {error:"Restricted File", description:"Not allowed"})
    }
    else {
        fs.readFile(path.join(`${__dirname}/../`,`quiz/${quiz}.json`), function (err, data) {
            
            if (err) return res.render('error.ejs', {error:"Nonexistent quiz", description:err});
            qHTML = ""
            questions = JSON.parse(data.toString()).questions;
            qList = Object.keys(questions);
            qHeader = `<div class='sep'></div><div class='sep'></div><h1 qid="<%-questionid%>" style="color:<%=color%>;text-transform:uppercase;letter-spacing:4px;"><%=text%></h1>\n<div class='sep'></div><div class="buttonFlex"><%-buttons%></div>`
            button = '<button style="background:<%=color%>" questionid="<%-questionid%>" onclick="process(this)"><%=text%></button>'

            for(let j=0;j<qList.length;j++) { //for each question
                let qNum = qList[j]
                color = misc.randColor();
                console.log(color)
                answerChoices = "";
                questionObject = questions[qNum];
                question = Object.keys(questionObject)[0]
                console.log(question)
                
                choiceList = questionObject[question]
                console.log(choiceList)
                misc.shuffle(choiceList) //without this, the first answer will always be right
                choiceList.forEach(choice => { //for choices in choicelist for the question
                    answerChoices += ejs.render(button, {color:color, text:choice, questionid:j})
                })
                qHTML += ejs.render(qHeader, {color:color, text:question, buttons:answerChoices, questionid:j})
                console.log(qHTML)
            };

            console.log(questions)
            res.render('quiz.ejs', {questionHTML:qHTML, title:quiz})
        });
    }
    

})

WServer.on("connection", async function(wsclient){
    let wMessages = 0;
    let answers = {

    };
    let currentQ = 0;
    let quiz = "";
    let validQuiz = undefined;
    quizJSON = "";
    wsclient.on("message", function(data){
        
        console.log(wMessages);
        if (data.toString() != "KEEPALIVE"){

            if (data.toString() == "EOQ"){
                if (validQuiz != undefined){
                    quizJSON = JSON.parse(fs.readFileSync(path.join(`${__dirname}/../`,`quiz/${validQuiz}.json`)).toString())
                    console.log("End of quiz!!")
                    console.log(quizJSON)
                    questionJSON = quizJSON["questions"]
                    
                    let correctAnswers = 0;
                    console.log(answers)
                    Object.keys(questionJSON).forEach(currentQ => {
                        correctAnswer = questionJSON[currentQ.toString()]["CorrectAnswer"];
                        if (answers[(parseInt(currentQ)-1).toString()] == correctAnswer){
                            correctAnswers++
                        }
                    });
                    let questionCount = Object.keys(questionJSON).length
                    
                    console.log(`${correctAnswers}/${questionCount} correct`)
                    wsclient.send(`SCORE|${correctAnswers}/${questionCount}`)
                }
                
                else {
                    return wsclient.send("error")
                }
            }
            
            else {
                
                if (wMessages==0){
                    //expect name of quiz
                    quiz = data.toString()
                    console.log(quiz)
                    
                    matchList = ["/", "\\.\\.", "%2F", "%2E%2E", "%5C"]
                    detected = false;
                    matchList.forEach(match=>{
                        if (quiz.match(match) != null){
                            detected=true   
                        }
                    })
                    if (detected){

                        wsclient.send("error")
                        wsclient.close()
                    }
                    
                    if (fs.existsSync(path.join(`${__dirname}/../`,`quiz/${quiz}.json`))) {
                        wsclient.send("processed")
                        console.log(`${quiz} is a valid quiz`)
                        validQuiz = quiz;
                        wMessages++
                    }
                    
                    else {
                        return wsclient.send("error")
                    };
                    
                }
                
                else {
                    currentQ = data.toString().split('|')[0]
                    answersent = data.toString().split('|')[1]
                    
                    answers[currentQ] = answersent;
                    
                    
                    console.log("Understood answer")
                    wsclient.send(`processed|${currentQ}`)
                    
                }
            }
        }

        else {
            wsclient.send("I kept you alive!")
        }
    })
})



app.get('/isQuiz', function(req,res){
    matchList = ["/", "\\.\\.", "%2F", "%2E%2E", "%5C"]
    matchList.forEach(match=>{
        if (req.params.quiz.match(match) != null){
            res.status(400)
            return res.send('error.ejs', {error:"why", description:"Invalid characters"})
        }
    })
    
    if (fs.existsSync(path.join(`${__dirname}/../`,`quiz/${quiz}.json`))) {
        return res.render('error.ejs', {error:"Quiz Exists", description:"That quiz already exists!"})
    }
})

app.post('/makeQuiz', function(req,res){
    auth = clean(req.cookies.auth).split(':')
    username = base64dec(auth[0])
    password = base64dec(auth[1])

    if (!authenticate(username, hash(password))){
        res.status(401)
        return res.render('error.ejs', {error:"Authentication Error", description:"You are not logged in!"})
    }
    //we dont need to handle "else", it already returned 

    

    console.log(req.body)
    quiz = clean(req.body.quizname);
    if (quiz.match("/") != null || quiz.match("\\.\\.")  != null || quiz.match("%2F")  != null || quiz.match("%2E%2E") !=null ){
        return res.render('error.ejs', {error:"why", description:"Invalid characters"})
    }

    else {
        
        /* THIS IS HOW THE DATA SHOULD END UP AFTER PARSING
            "questions":{
                "1":{
                    "sample question here":["choice1", "choice2"]
                    "CorrectAnswer":"choice2"
        
                }
            }*/
        
        
        //quiz is available
        keys = Object.keys(req.body).slice(3)
        //begin parsing the content
        console.log(keys)
        base = {
            "questions" : {

            }
        }
        keys.forEach(element => {
            element = clean(element)
            console.log(element)
            portions = element.split(':')
            elemType = portions[0]
            qNum = portions[1]

            if (elemType == "question") {
                base.questions[qNum] = {}
                base.questions[qNum][req.body[element]] = []
            }

            else {
                ansId = portions[2]
                question = Object.keys(base.questions[qNum])[0]
                
                /*
                IMPORTANT DEBUG INFO
                //base.questions['1']     is    { HiGuys: [] }
                //we need ['HiGuys'].push
                //base.questions[qNum][question] is the answerset []
                //base.questions[qNum][question].push
                */

                base.questions[qNum][question].push(req.body[element])

                if (portions.slice(-1) == "correct"){ //if type:qNum:answerID:correct
                    base.questions[qNum]["CorrectAnswer"] = req.body[element]
                }
            }
        })
        console.log(base)

        UID = createUnique()
        attempt = 0
        while (fs.existsSync(`${__dirname}/../quiz/`,`${UID}.json`)){
            UID = createUnique()
            attempt++
            if (attempt > 100){
                return res.render('error.ejs', {error:"Server Error", description:"Could not create unique ID. Try again later?"})
            }

        }

        quizPath = path.join(`${__dirname}/../quiz/`,`${UID}.json`)

        fs.appendFile(quizPath,JSON.stringify(base,null,'\t'), function(){
            res.redirect(`/quiz/${quiz}`)
        })


        keywords = clean(req.body.keywords).split(',')
        description = req.body.description
        fs.readFile(path.join(`${__dirname}/../quiz/`,`data.json`), function(err,data){
            data = JSON.parse(data.toString())
            currentQuiz = data.length
            data[currentQuiz] = {
                id : UID,
                name : quiz,
                description : description,
                keywords : keywords,
                createdBy : username,
                url:`/quiz/${UID}`
            }

            fs.writeFile(path.join(`${__dirname}/../quiz/`,`data.json`), JSON.stringify(data,null,'\t'), function(err){
                console.log(err)
            })
        })
    }
})




app.listen(port, host,function(data){
    console.log(`App is running on port ${port}\nGo to the page with http://localhost:${port}/\nAdmin page http://localhost:${port}/admin/signin\n\n --LOGGING--\n`)
})
