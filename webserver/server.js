//IMPORTS
const imports = require("./imports.js")

keys = (Object.keys(imports))
keys.forEach(key => {global [key] = imports[key]}) //im a genius!!!

const express = require('express')
const http = require('http')
const https = require('https')

var nullbyte = new RegExp(/\0/g)

async function authenticate(username, hash){
    username = username.replace(nullbyte,"")
    const client = await userPool.connect();
    const result = await client.query("SELECT * FROM users WHERE username = $1 AND pwdhash = $2", [username,hash])
    client.release()

    return (result.rowCount != 0) //if rowcount not equal to 0, it exists and a match has been made
}




const { fs, path } = require("./imports.js")
const miscObj = require("../modules/misc.js")
keys = (Object.keys(miscObj))
keys.forEach(key => {global [key] = miscObj[key]}) //im a genius YET AGAIN! I forgot to make it import all misc things, so it failed instantly! [this is the fix :shocked:]!!!
const app = express();

app.use(imports.middleWare) //i know i added it as a global variable but this is a cleaner way of showing it
app.set('render engine','ejs')
app.use(express.json())


const pg = require('pg') //I wouldve kept it in the imports but this is a very important import and it helps to have better autocomplete for it
const { base64dec, isClean, base64enc } = require("../modules/misc.js")

fileHandlers = []

var host = '0.0.0.0'

const serverinfo = {
    wsport : process.env.wsPort,
    quizzlePort : process.env.publicPort
}
console.log(serverinfo)
var port = 8080; //do not change, there is no need to change this, it is the port that quizzle is on BUT ONLY IN THE CONTAINER. to change the public port, set env variables for quizzlePort

databasePort = 5432;
const settings = {
    host:process.env.PGHOST,
    user:process.env.PGUSER,
    password:process.env.PGPASSWORD,
    database:process.env.PGDATABASE,
    port:databasePort
}

const userPool = new pg.Pool({
    max:25,
    ...settings
})
const searchPool = new pg.Pool({
    max:25,
    ...settings
})

function authRead(authString){
    console.log(authString.split(":"))
    if (authString.split(":").length == 1 || authString == ":"){
        console.log("gotcha")
        return {
            username:"",
            password:""
        }
    }
    const basic = clean(authString).split(':')
    return {
        username:base64dec(basic[0]),
        password:base64dec(basic[1])
    }
}
const server = http.createServer(app)


console.log(settings)
var WServer = new ws.Server({
    server:server,
    path : "/quizSocket"
});


app.get('/', function(req,res){
    res.render('index.ejs')
})

/*
app.get('/whoami', function(req,res){
    if (req.cookies.auth)
    res.render('index.ejs')
})*/

app.get('/admin/', async function(req,res){ 
    if (req.cookies.auth){
        const auth = clean(req.cookies.auth)
        
        let {username,password} = authRead(auth)
        //username = username.replace(nullbyte)
        const authenticated = await authenticate(username, hash(password));
        console.log("checking auth")
        
        if (authenticated){
            const admin = await isAdmin(username, hash(password))
            if (admin){
                return res.render('adminPanel.ejs')
            }
            return res.status.redirect('/teacher/')
        }

    }
    res.redirect('/signIn/')
})

app.get('/makeQuiz', async function(req,res){
	auth = clean(req.cookies.auth)

    const {username,password} = authRead(auth)
    const authenticated = authenticate(username, hash(password))
    if (authenticated){
        return res.render('quizmaker.ejs');
    }
})

app.get('/teacher/', async function(req,res){
    if (req.cookies.auth){
        auth = clean(req.cookies.auth)

        const {username,password} = authRead(auth)
        const authenticated = await authenticate(username, hash(password));

        if (authenticated){
            await isAdmin(username,hash(password)) ? res.redirect(200,'/admin/') : res.render("teacherPanel.ejs")
            return
        }
    }
    res.redirect('/signIn/')
})


app.get('/signIn/', async function(req,res){
    if (req.cookies.auth){
        auth = clean(req.cookies.auth)

        const {username,password} = authRead(auth)


        const givenHash = hash(password)
        const authenticated = await authenticate(username, givenHash);
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
        const authenticated = await authenticate(username, givenHash);
        if (authenticated){
            //expire cookie in 1 day
            res.cookie('auth', base64enc(username)+":"+ base64enc(password), {maxAge: 86400000, httpOnly: true, sameSite: "strict"})

            return (await isAdmin(username,givenHash) ? res.redirect('/admin/') : res.redirect('/teacher/'));
        }
    }
    data = {
        error:"401 - Unauthorized",
        description:"Invalid authentication"
    }
    return res.render("error.ejs", data)
    
})



/*------------------
      ADMIN 
      PANEL
--------------------*/

async function isAdmin(username, hash){
    username = username.replace(nullbyte,"");
    const client = await userPool.connect();
    const result = await client.query("SELECT administrator FROM users WHERE username = $1 AND pwdhash = $2", [username,hash])
    await client.release()
    if (result.rowCount != 0){
        return result.rows[0].administrator
    }
    else {
        return false
    }
}



app.post("/makeAccount", async function(req,res){
    if (!req.cookies.auth){
        return res.render("./error.ejs", {error:"401 - Unauthorized",description:"You must be authorized for this!"})
    }


    const dat = authRead(req.cookies.auth)

    const admin = await isAdmin(dat.username, hash(dat.password))
    if (!admin){ //if the account details dont match up or dont exist, SQL wont pick it up anyways, so this works as an admin check AND auth check
        return res.render("./error.ejs", {error:"401 - Unauthorized",description:"You must be an admin for this!"})
    }

    if (!req.body.password || !req.body.username){
        return res.render("./error.ejs", {error:"400 - Bad Request",description:"You must include the proper body!"})
    }
    username = req.body.username.replace(nullbyte,"")
    hashedpassword = hash(req.body.password)
    const client = await userPool.connect();
    await client.query("INSERT INTO users(username,pwdhash,administrator) VALUES ($1, $2, false) ON CONFLICT(username) DO NOTHING", [username,hashedpassword])
    client.release()
    res.render("./adminPanel.ejs")
}) 

app.post("/editAccount", async function(req,res){
    if (!req.cookies.auth){
        return res.render("./error.ejs", {error:"401 - Unauthorized",description:"You must be authorized for this!"})
    }


    const dat = authRead(req.cookies.auth)
    let {username, password} = dat 
    const authenticated = await authenticate(username, hash(password));

    const admin = await isAdmin(username, hash(password))
    const canModify = admin || authenticated

    if (!canModify)
        return res.render("./error.ejs", {error:"401 - Unauthorized",description:"You cannot modify this password!"})

    username = dat.username.replace(nullbyte,"")
    hashedpassword = hash(req.body.password)
    const client = await userPool.connect();
    await client.query("UPDATE users SET pwdhash = $2 WHERE username = $1", [username,hashedpassword])
    client.release()
    res.render("./adminPanel.ejs")
})

app.get('/search', async function(req,res){
    if (req.query.search == undefined){
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
        //24/12/22 HPP fix for when its a dict and not just a list
        typeof search=='object' ? search = "" : null; //HPP prevention, otherwise it'll crash when search is not a string

        search = search.replace("\\","\\\\").replace("%","\\%").replace("_","\\_") //To prevent wildcards being placed, query would just be % or _ and everything would match, so here's the fix
        search = search.trim().replace(nullbyte, ""); // sunglass emoji here + no more nullbyte chicanery

        if (search==""){
            return res.render("./error.ejs", {error:"400 - Bad request!", description:"Hello student where is your search"})
        }

        const client = await searchPool.connect();

        const result = await client.query("SELECT * FROM search WHERE quizname ILIKE $1 OR quizdescription ILIKE $1 OR keywords ILIKE $1",[`%${search}%`])
        res.render("./results.ejs", {query:originalSearch, results:base64enc(JSON.stringify(result.rows))}) // b64 because im inserting it raw, not filtered or escaped, it can trigger xss by making a quiz called e"};alert(1); 
        //im keeping it raw because the data has to be exactly how it was given to the server, filtering will be done on the actual html elements
    
        
        return await client.release()
    }
})

app.get('/quizinfo/', async function(req,res){
    
    if (req.query.quiz === undefined)
        return res.status(400).send("missing parameter")
    
    quiz = clean(req.query.quiz) //nullbyte removal included
    const client = await searchPool.connect()
    
    const out = await client.query("SELECT * FROM search WHERE quizurl = $1",[quiz])
    res.send(out.rows)

    return client.release()
})

app.get('/discover/', async function(req,res){
    const client = await searchPool.connect()
    
    const out = await client.query("SELECT * FROM search ORDER BY random() LIMIT 5")
    res.send(out.rows)

    return client.release()
})

app.get('/quiz/:quiz', async function(req,res){ //no db calls here
    let quiz = req.params.quiz
    
    if (quiz.match("/") != null || quiz.match("\\.\\.")  != null || quiz.match("%2F")  != null || quiz.match("%2E%2E") !=null ){
        return res.render('error.ejs', {error:"why", description:"you know what you did"})
    }
    else {
        fs.readFile(path.join(`${__dirname}/../`,`quiz/${quiz}.json`), function (err, data) {
            
            if (err) return res.render('error.ejs', {error:"Nonexistent quiz", description:err});
            qHTML = ""
            mainJSON = JSON.parse(data.toString())
            questions = mainJSON.questions;
            qList = Object.keys(questions);
            qHeader = `<div class='sep'></div><div class='sep'></div><h1 qid="<%=questionid%>" style="text-transform:uppercase;letter-spacing:4px;"><%=text%></h1>\n<div class='sep'></div><div class="buttonFlex"><%-buttons%></div>`
            button = '<button questionid="<%=questionid%>" onclick="process(this)"><%=text%></button>'

            for(let j=0;j<qList.length;j++) { //for each question
                let qNum = qList[j]
                answerChoices = "";
                questionObject = questions[qNum];
                question = Object.keys(questionObject)[0]
                
                choiceList = questionObject[question]
                shuffle(choiceList) //without this, the first answer will always be right
                choiceList.forEach(choice => { //for choices in choicelist for the question
                    answerChoices += ejs.render(button, {text:choice, questionid:j})
                })
                qHTML += ejs.render(qHeader, {text:question, buttons:answerChoices, questionid:j})
            };

            res.render('quiz.ejs', {questionHTML:qHTML, title:mainJSON.name})
        });
    }
    

})

WServer.on("connection", async function(wsclient){ //no db calls here
    let wMessages = 0;
    let answers = {};
    let currentQ = 0;
    let quiz = "";
    let validQuiz = undefined;
    quizJSON = "";
    wsclient.on("message", function(data){
        
        if (data.toString() != "KEEPALIVE"){

            if (data.toString() == "EOQ"){
                if (validQuiz != undefined){
                    quizJSON = JSON.parse(fs.readFileSync(path.join(`${__dirname}/../`,`quiz/${validQuiz}.json`)).toString())
                    questionJSON = quizJSON["questions"]
                    let correctAnswers = 0;
                    
                    Object.keys(questionJSON).forEach(currentQ => {
                        correctAnswer = questionJSON[currentQ.toString()]["CorrectAnswer"];
                        if (answers[(parseInt(currentQ)-1).toString()] == base64enc(correctAnswer)){
                            correctAnswers++
                        }
                    });
                    let questionCount = Object.keys(questionJSON).length
                    
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
                    

                    if (!isClean(quiz)){

                        wsclient.send("error")
                        return wsclient.close()
                    }
                    
                    if (fs.existsSync(path.join(`${__dirname}/../`,`quiz/${quiz}.json`))) {
                        wsclient.send("processed")
                        validQuiz = quiz;
                        wMessages++
                    }
                    
                    else {
                        wsclient.close()
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
    let mandatory = ["quizname","description","keywords","question:1", "choice:1:1:correct", "choice:1:2"]
    
    let filtered = mandatory.filter(val=>val in req.body)
    console.log(filtered)
    if (filtered.length != mandatory.length){
        return res.render('error.ejs', {error:"You've left something!", description:"Something is missing!"})
    }

    if (!req.cookies.auth){
        return res.render('error.ejs', {error:"Authentication Error", description:"You are not logged in!"})
    }

    let auth = authRead(req.cookies.auth)
    let {username,password} = auth;

    if (username=="" && password == ""){
        return res.render('error.ejs', {error:"HTTP 293849898 - why did you that", description:"Give a valid cookie next time!"})
    }

    const authenticated = await authenticate(username, hash(password));
    if (!authenticated)
        return res.status(401).render('error.ejs', {error:"Authentication Error", description:"You are not logged in!"})
    
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


    //Format checking here
    checking = {}
    answerChecks = {}
    try{

        Object.keys(req.body).forEach(key => {
            if (typeof key != "string")throw new Error("Invalid JSON : Key not a string"); //2 most important checks
            if (req.body[key].trim() == "")throw new Error("Invalid JSON : Empty Key");
            
            protPollution = function(key){
                return (key.trim() == "prototype" || key.trim() == "__proto__" || key.trim() == "constructor")
            }
            if (protPollution(key))throw new Error("Stop trying to hack me wahhhh") //check for prototype pollution in the key. DO NOT check for it in the value otherwise you cant name a field "prototype"
            
            
            //Format Checking for Question
            if (key.startsWith("question:")){
                if (key.split(':').length != 2)throw new Error("Invalid JSON : Question key is not in the format question:<number>")
                if (isNaN(key.split(':')[1].replace(' ','')))throw new Error("Invalid JSON : Question id is not a number")
                checking[key.split(':')[1]] = []
            }

            //Format Checking for a choice
            else if (key.startsWith("choice:")){
                fmat = "The JSON you sent was invalid! choice:<questionID>:<choiceId> / choice:<questionID>:<choiceId>:correct should be followed!"
                choiceParsed = key.split(':')
                if (choiceParsed.length < 3 || //Cant be less than 3 pieces
                    (choiceParsed.length >= 4 && choiceParsed[3] != "correct")//Cant be 4 pieces without ending with :correct
                    || isNaN(choiceParsed[2]) || isNaN(choiceParsed[1]) //choice:NUM:NUM must be followed
                    ) 
                        throw new Error(fmat)

                if (checking[choiceParsed[1]] == undefined)throw new Error("The JSON you sent was invalid! That question doesnt exist!") //Question MUST be in the request body BEFORE the choices
                if (choiceParsed[3] == "correct")answerChecks[choiceParsed[1]] = true //Mark answer for question id as Found
                
                checking[choiceParsed[1]].push(choiceParsed[2])
            }
        })

        Object.keys(checking).forEach(key => {
            if (checking[key].length < 2)throw new Error("You need at least 2 choices for each question!")
            if (answerChecks[key] == undefined)throw new Error("You need to specify if a question is correct!")
        })

    }
    catch (e){
        console.warn(e.stack)
        return res.render('error.ejs', {error:"Invalid JSON", description:e})
    }
    //Format checking done
    

    quiz = clean(req.body.quizname);
    if(quiz.trim() == ""){
        return res.status(400).render('error.ejs', {error:"Quiz Name Error", description:"Quiz name cannot be empty!"})
    }

    else {
        keys = Object.keys(req.body).slice(3) //quizname,description,keywords
        //begin parsing the content
        base = {
            "questions" : {

            }
        }
        keys.forEach(element => {
            element = clean(element)
            portions = element.split(':') //keep in mind we are only splitting the key
            elemType = portions[0]
            qNum = portions[1]

            if (elemType == "question") {
                base.questions[qNum] = {}
                base.questions[qNum][req.body[element]] = []
            }

            else {
                ansId = portions[2]
                question = Object.keys(base.questions[qNum])[0]

                base.questions[qNum][question].push(clean(req.body[element]))

                if (portions.slice(-1) == "correct"){ //if type:qNum:answerID:correct
                    base.questions[qNum]["CorrectAnswer"] = clean(req.body[element])
                }
            }
        })

        const client = await searchPool.connect();
        exists = true
            
        
        keywords = clean(req.body.keywords)
        description = req.body.description
        
        let generated = await client.query("INSERT INTO search (quizname, quizdescription, keywords, createdby) VALUES ($1,$2,$3,$4) RETURNING quizurl;", [quiz, description,keywords,username].map((value)=>value.replace(nullbyte, "")))
        let url = generated.rows[0].quizurl
        base['name'] = quiz
        quizPath = path.join(`${__dirname}/../quiz/`,`${url}.json`)

        fs.appendFile(quizPath,JSON.stringify(base), function(){ //removed \t to save json space
            res.redirect(`/quiz/${url}`)
        })

        client.release()
    
    
    
    }
})

app.get("/admin/userEdit", async function(req,res){
    if (req.cookies.auth == undefined)
        return res.status(401).send("No authorization given")
    

    const {username, password} = authRead(req.cookies.auth)
    
    
    const admin = await isAdmin(username, hash(password)) //acts as both authentication and admin checker, see line 171
    
    if (!admin)
        return res.status(401).render('error.ejs', {error:"Unauthorized", description:"You aren't meant to be here!"})
    
    res.render("./userEdit.ejs")


})

app.get('/admin/users', async (req, res) => {
    if (req.cookies.auth == undefined)
        return res.status(401).send("No authorization given")
    

    const {username, password} = authRead(req.cookies.auth)
    
    
    
    const admin = await isAdmin(username, hash(password))
    
    if (!admin)
        return res.status(401).render('error.ejs', {error:"Unauthorized", description:"You aren't meant to be here!"})

    const client = await userPool.connect();
    let result;

    if (req.query.page){
        page = clean(req.query.page)
        if (isNaN(parseInt(page))){
            client.release();
            return res.send([{"username":"Invalid Number", "pwdhash":"Invalid Number","administrator":"???"}])
        }
        page*=100
        result = await client.query("SELECT * FROM users LIMIT 100 OFFSET $1", [page])
    }
    else {
        result = await client.query("SELECT * FROM users LIMIT 100")
    }
    client.release()
    return res.send(result.rows);
    

})

app.get('/admin/userCount', async (req, res) => {
    if (req.cookies.auth == undefined)
        return res.status(401).send("No authorization given")
    

    const {username, password} = authRead(req.cookies.auth)
    const admin = await isAdmin(username, hash(password))
    
    if (!admin)
        return res.status(401).render('error.ejs', {error:"Unauthorized", description:"You aren't meant to be here!"})

    const client = await userPool.connect();
    let result = await client.query("SELECT COUNT(*) FROM users")
    client.release()
    return res.send(result.rows[0]);
})

app.get('/admin/delete', async function(req,res){
    if (req.cookies.auth == undefined)
        return res.status(401).send("No authorization given")


    const {username, password} = authRead(req.cookies.auth)




    if (req.query.user){
        const admin = await isAdmin(username, hash(password))

        if (!admin)
            return res.status(401).render('error.ejs', {error:"Unauthorized", description:"You aren't meant to be here!"})

        
        const client = await userPool.connect();
        let result;
        result = await client.query("SELECT * FROM users WHERE username=$1", [req.query.user.replace(nullbyte, "")])

        if (result.rows.length == 0){
            client.release()
            return res.status(403).send("invalid user")
        }

        else if (result.rows[0].administrator==true){
            client.release()
            return res.status(401).send("no perms")
        }
        
        
        await client.query("DELETE FROM users WHERE username=$1", [req.query.user.replace(nullbyte, "")])
        client.release()

        return res.status(200).send("done")
    }
})
//The endpoint to modify a user
app.post("/admin/modifyUser", async function(req,res){
    console.log(req.body)
    params = req.body
    if (!(params.originalName && (params.username || params.password))  )
        return res.status(400).send("bad request")
    

    const {username, password} = authRead(req.cookies.auth)
    const admin = await isAdmin(username, hash(password))
    if (!admin)
        return res.status(401).send("unauthorized/forbidden")
    


    let targetname = params.originalName.replace(nullbyte, "") //targetname is the name of the person we're modifying
    const client = await userPool.connect();
    let userexists = (await client.query("SELECT * FROM users WHERE username = $1", [targetname])).rowCount != 0
    if (!userexists){
        res.status(400).send("user doesnt exist in order to modify!")
    }
    
    if (params.username && !(params.username == targetname)){
        let newName = params.username.replace(nullbyte, "")
        let exists = (await client.query("SELECT * FROM users WHERE username = $1", [newName])).rowCount != 0
        if (exists){
            client.release()
            return res.status(403).send("username conflicts with existing user!")
        }
        
        await client.query("UPDATE users SET username = $1 WHERE username = $2", [newName, targetname])
        targetname = params.username
    }
    if (params.password)
        await client.query("UPDATE users SET pwdhash = $1 WHERE username = $2", [hash(params.password), targetname])
    

    client.release()
    return res.status(200).send("done")

})

//quiz delete panel code starts now
app.get("/user/quizDelete", async function(req,res){ //no manual db calls
    if (req.cookies.auth == undefined)
        return res.status(401).send("No authorization given")
    

    const {username, password} = authRead(req.cookies.auth)
    
    const authenticated = await authenticate(username,hash(password))

    if (!authenticated)
        return res.status(401).render('error.ejs', {error:"Unauthorized", description:"You aren't meant to be here!"})
    
    res.render("./qDelete.ejs")
})


app.get('/user/quizzes', async function(req,res){
    if (req.cookies.auth == undefined)
        return res.status(401).send("No authorization given")
    

    let {username, password} = authRead(req.cookies.auth)
    
    username = username.replace(nullbyte, "")
    
    
    const admin = await isAdmin(username, hash(password))
    let authenticated = admin
    if (!admin)
        authenticated = await authenticate(username,hash(password))
    
    if (!authenticated){
        return res.status(401).send("unauthorized")
    }
    const client = await searchPool.connect();
    let result;


    if (admin){
        if (req.query.page){
            page = clean(req.query.page)
            if (isNaN(parseInt(page))){
                client.release()
                return res.send([{"username":"Invalid Number", "pwdhash":"Invalid Number","administrator":"???"}])
            }
            page*=100
            result = await client.query("SELECT * FROM search LIMIT 100 OFFSET $1", [page])
        }
        else {
            result = await client.query("SELECT * FROM search LIMIT 100")
        }
    }
    else {
        if (req.query.page){
            page = clean(req.query.page)
            if (isNaN(parseInt(page))){
                client.release()
                return res.send([{"quizname":"Invalid Number", "pwdhash":"Invalid Number","administrator":"???"}])
            }
            page*=100
            result = await client.query("SELECT * FROM search WHERE createdby = $1 LIMIT 100 OFFSET $2", [username, page])
        }
        else {
            console.log(username)
            result = await client.query("SELECT * FROM search WHERE createdby = $1 LIMIT 100", [username])
        }
    }

    client.release()
    return res.send(result.rows);
    
})

app.post('/removeQuiz', async function(req,res){ // NULLBYTE SAFE!
    if (!req.body.username && !req.body.password){
        if (req.cookies.auth == undefined){ //yes i can shove it into one if statement but this way is more readable for me
            return res.status(401).send("No authorization given")
        }
    }

    let auth;
    //if no cookies specifying authentication, use the authentication from the body
    if (req.cookies.auth == undefined){
        auth = {username:req.body.username,pass:req.body.password}
    }
    else {
        auth = authRead(req.cookies.auth)
        auth = {username:auth.username,pass:auth.password}
    }
    //i couldve just moved username and pass declaration up and written directly to it...
    //whatever, i'll rewrite later, this is Dec 6 2022, watch it never get rewritten


    let {username, pass} = auth
    username = clean(username)
    const authenticated = await authenticate(username, hash(pass))
    if (!authenticated){
        res.clearCookie('auth')
        return res.status(401).send("unauthorized")
    }

    if (req.body.quizurl){
        const client = await searchPool.connect();
        const qurl = req.body.quizurl.replace(nullbyte, "")
        const exists = await client.query("SELECT * FROM search WHERE quizurl = $1", [qurl])

        if (exists.rowCount == 0){
            client.release();
            return res.send("doesnt exist")
        }

        const admin = await isAdmin(username, hash(pass))

        
        const result = await client.query("SELECT * FROM search WHERE createdby = $1 AND quizurl = $2", [username,qurl])
        console.log(result.rowCount)
        const owner = result.rowCount != 0 //if rowcount not equal to 0, it exists and a match has been made

        const canDelete = admin || owner

        if (!canDelete){
            client.release();
            return res.status(401).send("You are not allowed to delete this quiz!")
        }
        //STEPS
        await client.query("DELETE FROM search WHERE quizurl = $1", [qurl])
        await client.release();
        fs.unlink(path.join(`${__dirname}/../quiz/`,`${req.body.quizurl.replace("/quiz/","")}.json`), function(err){ //delete .json
            if (err){
                return res.status(403).send("error")
            }
            return res.send('success')
        })
    }
    else {
        return res.status(400).send("No id given")
    }
})


app.get('/user/quizCount', async function(req,res){
    if (req.cookies.auth == undefined)
        return res.status(401).send("No authorization given")
    

    const {username, password} = authRead(req.cookies.auth)
    
    
    
    const admin = await isAdmin(username, hash(password))
    let authenticated = admin
    if (!admin)
        authenticated = await authenticate(username,hash(password))
    
    if (!authenticated){
        return res.status(401).send("unauthorized")
    }
    const client = await searchPool.connect();
    let result;


    if (admin){
        result = await client.query("SELECT COUNT(*) FROM search")
    }
    
    else {
        result = await client.query("SELECT COUNT(*) FROM search WHERE createdby = $1", [username.replace(nullbyte, "")])
    }
    client.release();
    return res.send(result.rows[0]);
})


server.listen(port, host,function(data){
    pubPort = serverinfo.quizzlePort
    console.log(`App is public on port ${pubPort}\nGo to the page with http://localhost:${pubPort}/\nAdmin page http://localhost:${pubPort}/signin\n\n --LOGGING--\n`)
})
