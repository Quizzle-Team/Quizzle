function closeDialog(){
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

function account(){
	center = document.getElementsByTagName("center")[0];
	center.innerHTML = "<div class='popup' style='opacity:0;'></div>\n"+center.innerHTML;
	
	template = `<img src="/x.svg" onclick="closeDialog()" style="width:10%;position:fixed;right:0;cursor:pointer;top:0;">
	<h1 style='padding-top:5px'>- Account Creation -</h1>
	<div class='sep'></div>
	<form action="/editAccount" method="POST">
		<h3>New Password</h3>
		<input name="password" style="text-transform:none">
		
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
	center = document.getElementsByTagName("center")[0];
	center.innerHTML = "<div class='popup' style='opacity:0;'></div>\n"+center.innerHTML;
	
	template = `<img src="/x.svg" onclick="closeDialog()" style="width:10%;position:fixed;right:0;cursor:pointer;top:0;">
	<h1 style='padding-top:5px'>- Account Creation -</h1>
	<div class='sep'></div>
	<form action="/makeAccount" method="POST">
		<h3>Username</h3>
		<input name="username" style="text-transform:none">

		<h3>Password</h3>
		<input name="password" style="text-transform:none">
		<div class='sep'></div>
		<h1>OPTIONS</h1>
		<h2><button type="submit">SUBMIT!</button> |OR| <button type="button" onclick="importer()">Import CSV!</button></h2>
	</form>
	<div class='sep'></div>`
	popup = document.querySelector('.popup')
	popup.innerHTML = template
	setTimeout(function(){

		popup.style.opacity = 1;
	},100)
}

