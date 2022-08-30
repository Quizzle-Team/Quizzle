//IMPORTS
const imports = require("./imports.js")

keys = (Object.keys(imports))
keys.forEach(key => {global [key] = imports[key]}) //im a genius!!!

const express = require('express')
const authenticate = require("../modules/authentication.js")
const { fs, path } = require("./imports.js")
const miscObj = require("../modules/misc.js")
keys = (Object.keys(miscObj))
keys.forEach(key => {global [key] = miscObj[key]}) //im a genius YET AGAIN! I forgot to make it import all misc things, so it failed instantly! [this is the fix :shocked:]!!!
const app = express();

app.use(imports.middleWare) //i know i added it as a global variable but this is a cleaner way of showing it
app.set('render engine','ejs')

const pg = require('pg') //I wouldve kept it in the imports but this is a very important import and it helps to have better autocomplete for it

fileHandlers = []

var port = 8080;
var host = '0.0.0.0'


databasePort = 5432;
const settings = {
    host:process.env.PGHOST,
    user:process.env.PGUSER,
    password:process.env.PGPASSWORD,
    database:process.env.PGDATABASE,
    port:databasePort
}

function authRead(authString){
    const basic = clean(authString).split(':')
    return {
        username:base64dec(basic[0]),
        password:base64dec(basic[1])
    }
}


console.log(settings)
var WServer = new ws.Server({
    port:"8000",
    path : "/quizSocket",
});


app.get('/', function(req,res){    
    res.render('index.ejs')
})

app.get('/admin/', async function(req,res){ 
    if (req.cookies.auth){
        auth = clean(req.cookies.auth)

        data = authRead(auth)
        uname = data.username
        password=data.password
        console.log("/admin/ says uname: "+uname+" password: "+password)
        const authenticated = await authenticate(uname, hash(password), settings);
        console.log("Am i authenticated?", authenticated)
        if (authenticated){
            const admin = await isAdmin(uname, hash(password))
            if (admin){
                console.log("uname is a confirmed admin")
                return res.render('adminPanel.ejs')
            }
            return res.redirect('/teacher/')
        }
    }
    res.redirect('/signIn/')
})

app.get('/makeQuiz', async function(req,res){
	auth = clean(req.cookies.auth)

    uname = base64dec(auth.split(':')[0])
    password = base64dec(auth.split(':')[1])
    const authenticated = authenticate(uname, hash(password),settings)
    if (authenticated){
        return res.render('quizmaker.ejs');
    }
})

app.get('/teacher/', async function(req,res){
    if (req.cookies.auth){
        auth = clean(req.cookies.auth)

        uname = base64dec(auth.split(':')[0])
        password = base64dec(auth.split(':')[1])

        console.log(password)
        const authenticated = await authenticate(uname, hash(password), settings);
        if (authenticated){
            await isAdmin(uname,hash(password)) ? res.redirect('/admin/') : res.render("teacherPanel.ejs")
            return
        }
    }
    res.redirect('/signIn/')
})


app.get('/signIn/', async function(req,res){
    console.log(req.cookies)
    if (req.cookies.auth){
        auth = clean(req.cookies.auth).split(':')
        username = base64dec(auth[0])
        password = base64dec(auth[1])

        const givenHash = hash(password)
        console.log(givenHash);
        const authenticated = await authenticate(username, givenHash, settings);
        console.log("authenticated?", authenticated)
        if (authenticated) await isAdmin(username,givenHash) ? res.redirect('/admin/') : res.redirect('/teacher/');
        
        
        else {
            data = {
                error:"401 - Unauthorized",
                description:"Invalid authentication"
            }
            res.clearCookie('auth') //i got stuck in an infinite invalid auth loop :thumbs_up:
            return res.render("error.ejs", data)
        }
        return;
    }
    res.render('signIn.ejs')
})

app.get('/logout', function(req,res){
    res.clearCookie('auth')
    res.redirect('/signIn/')
});

app.post('/signIn/', async function(req,res){
    if (req.body.password && req.body.username){
        username = clean(req.body.username);
        password = clean(req.body.password);
        const givenHash = hash(password)
        console.log(givenHash);
        const authenticated = await authenticate(username, givenHash, settings);
        console.log("authenticated?", authenticated)
        if (authenticated){
            //expire cookie in 1 day
            res.cookie('auth', base64enc(username)+":"+ base64enc(password), {maxAge: 86400000, httpOnly: true, sameSite: "strict"})

            await isAdmin(username,givenHash) ? res.redirect('/admin/') : res.redirect('/teacher/');
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


/*------------------
      TEACHER
      OPTIONS
--------------------*/
app.get('/changePass', function(req,res){
    const client = new pg.Client(settings)
    client.connect();
})
/*------------------
      ADMIN 
      PANEL
--------------------*/

async function isAdmin(username, hash){
    const client = new pg.Client(settings)
    client.connect();
    const result = await client.query("SELECT administrator FROM users WHERE username = $1 AND pwdhash = $2", [username,hash])
    console.log(result.rows)
    if (result.rowCount != 0){
        return result.rows[0].administrator
    }

    else {
        return false
    }
}



app.post("/makeAccount", async function(req,res){
    console.log(req.body)
    if (!req.cookies.auth){
        return res.render("./error.ejs", {error:"401 - Unauthorized",description:"You must be authorized for this!"})
    }


    const dat = authRead(req.cookies.auth)

    if (!(await isAdmin(dat.username, hash(dat.password)))){ //if the account details dont match up or dont exist, SQL wont pick it up anyways, so this works as an admin check AND auth check
        return res.render("./error.ejs", {error:"401 - Unauthorized",description:"You must be an admin for this!"})
    }
    console.log("Passed all checks!")

    const client = new pg.Client(settings)
    client.connect();
    username = req.body.username
    hashedpassword = hash(req.body.password)
    let final = await client.query("INSERT INTO users(username,pwdhash,administrator) VALUES ($1, $2, false) ON CONFLICT(username) DO NOTHING", [username,hashedpassword])
    
    //const result = await client.query("SELECT * FROM users")
    res.render("./adminPanel.ejs")
}) //test by creating and going to /admin/users/

app.get('/admin/users', async function(req,res){
    const client = new pg.Client(settings)
    client.connect();
    const result = client.query("SELECT * FROM users")
    res.send(result)
})


/*
document.querySelectorAll('h4 > a').forEach(result =>{
    window.deleteIcon = document.createElement('img')
    deleteIcon.setAttribute('src','trash.svg')
    result.appendChild(deleteIcon)
})
*/


//DO NOT USE THIS ENDPOINT YET. IT NEEDS TO USE THE DATABASE!
app.post('/removeQuiz', function(req,res){
    return res.status(500).send("Temporarily unavailable!")
    req.cookies.auth == undefined ? auth = [req.body.username, req.body.password] : auth = req.cookies.auth.split(':')

    if (!req.body.username && !req.body.password){
        if (req.cookies.auth == undefined){ //yes i can shove it into one if statement but this way is more readable for me
            return res.status(401).send("No authorization given")
        }
    }

    const {username, pass} = auth
    
    username = misc.base64dec(username)
    pass = misc.base64dec(pass)

    if (!authenticate(username, hash(pass), settings)){
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



app.get('/search', function(req,res){
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
        let originalSearch = search;
        typeof search=='object' ? search = search[0] : null; //HPP prevention, otherwise it'll crash when /search?search=hi&search=bye
        search = search.replace("\\","\\\\").replace("%","\\%") //To prevent wildcards being placed, query would just be % and everything would match, so here's the fix
        console.log(search)

        const client = new pg.Client(settings);
        client.connect()
        console.log("escaped", client.escapeIdentifier(search), client.escapeLiteral(search))
        client.query("SELECT * FROM search WHERE quizname ILIKE $1",[`%${search}%`], (err,result)=>{ // %search% to allow finding words that contain the query
            if (err){
                return res.render("./error.ejs", {error:"500 - Server Error", description:err})
            }
            else {
                return res.render("./results.ejs", {query:originalSearch, results:base64enc(JSON.stringify(result.rows))}) // b64 because im inserting it raw, not filtered or escaped, it can trigger xss by making a quiz called e"};alert(1); 
                //im keeping it raw because the data has to be exactly how it was given to the server, filtering will be done on the actual html elements
                
            }
        })
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
            mainJSON = JSON.parse(data.toString())
            questions = mainJSON.questions;
            qList = Object.keys(questions);
            qHeader = `<div class='sep'></div><div class='sep'></div><h1 qid="<%-questionid%>" style="color:<%=color%>;text-transform:uppercase;letter-spacing:4px;"><%=text%></h1>\n<div class='sep'></div><div class="buttonFlex"><%-buttons%></div>`
            button = '<button style="background:<%=color%>" questionid="<%-questionid%>" onclick="process(this)"><%=text%></button>'

            for(let j=0;j<qList.length;j++) { //for each question
                let qNum = qList[j]
                color = randColor();
                console.log(color)
                answerChoices = "";
                questionObject = questions[qNum];
                question = Object.keys(questionObject)[0]
                console.log(question)
                
                choiceList = questionObject[question]
                console.log(choiceList)
                shuffle(choiceList) //without this, the first answer will always be right
                choiceList.forEach(choice => { //for choices in choicelist for the question
                    answerChoices += ejs.render(button, {color:color, text:choice, questionid:j})
                })
                qHTML += ejs.render(qHeader, {color:color, text:question, buttons:answerChoices, questionid:j})
                console.log(qHTML)
            };

            console.log(questions)
            res.render('quiz.ejs', {questionHTML:qHTML, title:mainJSON.name})
        });
    }
    

})

WServer.on("connection", async function(wsclient){
    let wMessages = 0;
    let answers = {};
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

                    if (isNaN(currentQ)){
                        wsclient.send("Invalid data, hijack detected. Closing...") //if the client sends something invalid then its probably a hijack aka manual connection
                        return wsclient.close()
                    }

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




app.post('/makeQuiz', async function(req,res){

    if (!req.cookies.auth){
        return res.render('error.ejs', {error:"Authentication Error", description:"You are not logged in!"})
    }

    auth = clean(req.cookies.auth).split(':')
    let username = "";
    let password = "";

    try {
        username = base64dec(auth[0])
        password = base64dec(auth[1])
    } catch (e){ //either b64 failed or list index out of range
        return res.render('error.ejs', {error:"HTTP 293849898 - why did you that", description:"Give a valid cookie next time!"})
    }

    const authenticated = await authenticate(username, hash(password),settings);
    if (!authenticated){
        res.status(401)
        return res.render('error.ejs', {error:"Authentication Error", description:"You are not logged in!"})
    }
    //we dont need to handle "else", it already returned 

    

    console.log(req.body)

    if (typeof req.body == "string"){
        try {
            req.body = JSON.parse(req.body)
        }
        catch(e){
            return res.render('error.ejs', {error:"Invalid JSON", description:"The JSON you sent was invalid!"})
        }
    }

    if (Object.keys(req.body).length == 1){
        try {
            req.body = JSON.parse(Object.keys(req.body)[0])
        }
        catch {
            return res.render('error.ejs', {error:"Invalid JSON", description:"If God could explain to me just what exactly you were supplying as json then my life would be complete [if you think this is a mistake, contact me]"})
        }
    }

    if (Object.keys(req.body).length <= 4){       
        return res.render('error.ejs', {error:"Invalid JSON", description:"Something is missing here."})
    }

    

    //Format checking here
    checking = {}
    answerChecks = {}
    try{

    Object.keys(req.body).forEach(key => {
        console.log(key)
        if (typeof key != "string")throw new Error("Invalid JSON : Key not a string");
        if (req.body[key].trim() == "")throw new Error("Invalid JSON : Empty Key");
        
        protPollution = function(key){
            if (key.trim() == "prototype" || key.trim() == "__proto__" || key.trim() == "constructor"){
                return true
            }
        }
        if (protPollution(key))throw new Error("Stop trying to hack me wahhhh")
        if (protPollution(req.body[key]))throw new Error("Stop trying to hack me wahhhh")
        
        

        if (key.startsWith("question:")){
            console.log("Found a question", key)
            if (key.split(':').length != 2)throw new Error("Invalid JSON : Question key is not in the format question:<number>")
            
            if (isNaN(key.split(':')[1].replace(' ','')))throw new Error("Invalid JSON : Question id is not a number")
            
            checking[key.split(':')[1]] = []
            console.log("CHECKING  :")
            console.log(checking)
        }
        else if (key.startsWith("choice:")){
            fmat = "The JSON you sent was invalid! choice:<questionID>:<choiceId> / choice:<questionID>:<choiceId>:correct should be followed!"
            choiceParsed = key.split(':')
            if (choiceParsed.length < 3)throw new Error(fmat)
            
            if (choiceParsed.length >= 4 && choiceParsed[3] != "correct")throw new Error(fmat) //yes, multiple `if` statements, dont care!!
            if (isNaN(choiceParsed[2]))throw new Error(fmat)
            if (checking[choiceParsed[1]] == undefined)throw new Error("The JSON you sent was invalid! That question doesnt exist!")
            
            console.log("Am i correct? ", choiceParsed[3] == "correct", `ALSO ${choiceParsed}`)
            if (choiceParsed[3] == "correct")answerChecks[choiceParsed[1]] = true
            
            checking[choiceParsed[1]].push(choiceParsed[2])
        }
    })

    console.log(checking)
    Object.keys(checking).forEach(key => {
        console.log("ANSWER CHECK! DOES ",key," HAVE AN ANSWER?? ", answerChecks[key] == undefined) // too lazy to formatstrings
        if (checking[key].length < 2)throw new Error("You need at least 2 choices for each question!")
        if (answerChecks[key] == undefined)throw new Error("You need to specify if a question is correct!")
    })

    }
    catch (e){
        console.log(e.stack)
        return res.render('error.ejs', {error:"Invalid JSON", description:e})
    }

    
    //Format checking done
    

    quiz = clean(req.body.quizname);
    if(quiz.trim() == ""){
        return res.status(400).render('error.ejs', {error:"Quiz Name Error", description:"Quiz name cannot be empty!"})
    }

    /*if (quiz.match("/") != null || quiz.match("\\.\\.")  != null || quiz.match("%2F")  != null || quiz.match("%2E%2E") !=null ){
        return res.render('error.ejs', {error:"why", description:"Invalid characters"})
    }*/ //i forgot to remove this after i made a change that makes the quiz names pseudorandom [whoops]

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
        base = {
            "questions" : {

            }
        }
        keys.forEach(element => {
            element = clean(element)
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

        const client = new pg.Client(settings);
        client.connect();

        exists = true


        UID = createUnique()
        client.query("SELECT quizurl FROM search WHERE quizurl = $1", [`/quiz/${UID}`], (err, pgResult)=>{
            if (pgResult.rows.length != 0) //if it exists
                return res.render('error.ejs', {error:"Server Error", description:"Could not create unique ID. Try again later?"})
            

            base['name'] = quiz
            quizPath = path.join(`${__dirname}/../quiz/`,`${UID}.json`)

            fs.appendFile(quizPath,JSON.stringify(base), function(){ //removed \t to save json space
                res.redirect(`/quiz/${UID}`)
            })

            keywords = clean(req.body.keywords).split(',').join('  '); //the spacing isnt really needed but it makes it easier to read
            description = req.body.description

            client.query("INSERT INTO search (quizname, quizdescription, quizurl, keywords, createdby) VALUES ($1,$2,$3,$4,$5);", [quiz, description,`/quiz/${UID}`,keywords,username])
        
        })
    
    }
})


app.listen(port, host,function(data){
    console.log(`App is running on port ${port}\nGo to the page with http://localhost:${port}/\nAdmin page http://localhost:${port}/admin/signin\n\n --LOGGING--\n`)
})
