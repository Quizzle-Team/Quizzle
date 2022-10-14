function closeDialog(){
	document.querySelector(".popup-darken").classList.toggle("invis")

    scoreDiv = document.getElementsByClassName('popup')[0];
    scoreDiv.style.marginTop = '10px';
    setTimeout(function(){
        scoreDiv.style.marginTop='0';
        scoreDiv.style.opacity='0';
        setTimeout(function(){
            scoreDiv.parentNode.removeChild(scoreDiv);
        },200)
    },200)
}

function quiz(){
	document.location.href = "/makeQuiz"
}
function quizzes(){
	document.location.href = "/user/quizDelete"
	
}

function account(){
	document.querySelector(".popup-darken").classList.toggle("invis")
	center = document.getElementsByTagName("content")[0];
	center.innerHTML = "<div class='popup' style='opacity:0;'></div>\n"+center.innerHTML;
	
	template = `<img src="/x.svg" onclick="closeDialog()" style="width:50px;position:fixed;right:0;cursor:pointer;top:0;">
	<h1 style='padding-top:5px'>- Account Editor -</h1>
	<div class='sep'></div>
	<form action="/editAccount" method="POST">
		<h3>New Password</h3>
		<input name="password" style="text-transform:none" minlength="6">
		
		<div class='sep'></div>
		<h2><button type="submit">SUBMIT!</button></h2>
	</form>
	<div class='sep'></div>`
	popup = document.querySelector('.popup')
	
	popup.innerHTML = template

	setTimeout(function(){

		popup.style.opacity = 1;
	},100)
}

function makeAccount(){
	document.querySelector(".popup-darken").classList.toggle("invis")

	center = document.getElementsByTagName("content")[0];
	center.innerHTML = "<div class='popup' style='opacity:0;'></div>\n"+center.innerHTML;
	
	template = `<img src="/x.svg" onclick="closeDialog()" style="width:50px;position:fixed;right:0;cursor:pointer;top:0;">
	<h1 style='padding-top:5px'>- Account Creation -</h1>
	<div class='sep'></div>
	<form action="/makeAccount" method="POST">
		<h3>Username</h3>
		<input name="username" style="text-transform:none">

		<h3>Password</h3>
		<input name="password" style="text-transform:none" minlength="6">
		<div class='sep'></div>
		<h1>OPTIONS</h1>
		<h2><button type="submit" class="customButton">SUBMIT!</button><button type="button" onclick="importer()" class="customButton">Import CSV!</button></h2>
	</form>
	<div class='sep'></div>	
	`
	popup = document.querySelector('.popup')
	popup.innerHTML = template

	
	setTimeout(function(){

		popup.style.opacity = 1;
	},100)
}

function users(){
	document.location.href="/admin/userEdit"
}

function parseUsers(parseResult){
	console.log("afaf")
	let file = document.querySelector(`input[type="file"]`)
	file.remove()
	let users = parseResult.data
	console.log(users)
	users.forEach((pair)=>{
		//GET ES6'D ON!! LLLLLLL
		let [username, password] = pair
		console.log(JSON.stringify({
			"username" : username,
			"password" : password
		}))
		fetch("/makeAccount",{
			method:"post",
			headers:{"content-type":"application/json"},
			body:JSON.stringify({
				"username" : username,
				"password" : password
			})
		})
	})
}
function beginParsing(file){
	console.log("called")
	stream = Papa.parse(file, {
		complete: parseUsers
	})
}
function importer(){
	let fileInput = document.createElement("input")
	fileInput.setAttribute("type", "file")
	fileInput.style="display:none"
	document.body.append(fileInput)
	document.querySelector(`input[type="file"]`).addEventListener('input', function(){
        console.log('vaxsh good"')
		let file = fileInput.files[0]
		console.log(file)
		beginParsing(file)

    })
	fileInput.click()

}