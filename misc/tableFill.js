const clamp = (number, min, max) => Math.max(min, Math.min(number, max));
let total = document.querySelector('total')
let pnum = document.querySelector('pnum')

let url = document.location.pathname;
let table = document.querySelector('tbody')

let mode;


function processUsers(list){
    table.innerHTML =""
    list.forEach(row=>{
        let tablerow = document.createElement("tr")
        let editbutton = document.createElement("td")
        editbutton.style.textAlign = "center";
        if (mode == "users"){
            editbutton.innerHTML = '<img src="/pencil.svg" onclick="modify(this.parentElement)" style="width:2em;">'
        }
        else{
            editbutton.innerHTML = '<img src="/trash.svg" onclick="qDelete(this.parentElement.parentElement)" style="width:2em;">'
        }

        tablerow.append(editbutton)
        for (key in row){
            let cell = document.createElement("td")
            cell.style = "overflow-wrap: anywhere;overflow: hidden;"
            switch(key){
                case("pwdhash"):
                    cell.className="dots"
                    break;
                case("quizurl"):
                    cell.className="collapse"
            }
            
            cell.innerText = row[key]
            tablerow.append(cell)
        }
        table.append(tablerow)
    })
}

console.log(url)
switch (url){
    case("/admin/userEdit"):
        mode = "users"
        fetch("users")
            .then(response=>response.json())
            .then(array=>{processUsers(array)});

        fetch("userCount")
            .then(response=>response.json())
            .then(json=>{document.querySelector("total").innerHTML=Math.ceil(json.count/100)});
        break;
    case("/user/quizDelete"):
        mode = "quizzes"
        fetch("quizzes")
            .then(response=>response.json())
            .then(array=>{processUsers(array)});
        fetch("quizCount")
            .then(response=>response.json())
            .then(json=>{document.querySelector("total").innerHTML=Math.ceil(json.count/100)});
        break;
}

page = 0

function update(){
    newPage = parseInt(pnum.innerText)
    if (newPage == NaN || newPage<=0)
        return 0
    else {
    fetch(`${mode}?page=${newPage-1}`)
        .then(response=>response.json())
        .then(array=>{processUsers(array)});
    }
}

function back(){
    console.log("called")
    original = parseInt(pnum.innerText)
    backn = parseInt(pnum.innerText)
    if (backn == NaN || backn<=0)
        return 0
    
    backn = clamp(backn-1,1,parseInt(total.innerText))
    
    if (backn == original)
        return

    pnum.innerText = `${backn}`.trim()
    update()
}

function front(){
    original = parseInt(pnum.innerText)
    next = parseInt(pnum.innerText)
    if (next == NaN || next<=0)
        return 0
    
    next = clamp(next+1,1,parseInt(total.innerText))
    
    if (next == original)
        return

    pnum.innerText = `${next}`.trim()
    update()
}

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

function confdeleteUser(){
    center = document.getElementsByTagName("content")[0];
	center.innerHTML = "<div class='popup' style='opacity:1;z-index:5;box-shadow:0 0 2px 2px black'></div>\n"+center.innerHTML;

    template = `
    <button type="button" onclick="deleteUser(this)"  style="height: 100%;border: 2px solid #7349ff;">CONFIRM DELETE</button>
    <button type="button" onclick="this.parentElement.remove()" style="height: 100%;border: 2px solid #7349ff;">DO NOT DELETE</button>
    `
    popup = document.querySelector('.popup')
	popup.innerHTML = template

}

function deleteUser(button){
    fetch("/admin/delete?user="+document.querySelector('name').innerText)
    button.parentElement.remove()
}

function modify(td){
    let uname = td.parentElement.querySelectorAll("td")[1].innerText
    
    document.querySelector(".popup-darken").classList.toggle("invis")
	center = document.getElementsByTagName("content")[0];
	center.innerHTML = "<div class='popup' style='opacity:0;'></div>\n"+center.innerHTML;
	
	template = `<img src="/x.svg" onclick="closeDialog()" style="width:50px;position:fixed;right:0;cursor:pointer;top:0;">
	<h1 style='padding-top:5px'>- Editing <name></name> -</h1>
	<div class='sep'></div>
	<form action="/admin/modifyUser" method="POST">
    <div style="display: flex;justify-content: space-between;">
            <div style="width: 100%;">
                <input name="originalName" style="display:none" value="">
                <h3>Username</h3>
                <input name="username" style="text-transform:none" value="">

                <h3>New Password</h3>
                <input name="password" style="text-transform:none" minlength="6">
            </div>
            <div style="width: 100%;">
                <h2 style="color: red;display: flex;flex-direction: column;align-content: center;">
                    DELETE USER
                    <button type="button" onclick="confdeleteUser()"><img src="/trash.svg" style="height: 5rem;"></button>
                </h2>
            </div>
        </div>
		<h2><button type="submit">SUBMIT!</button></h2>
	</form>
	<div class='sep'></div>`
	popup = document.querySelector('.popup')
	
	popup.innerHTML = template
    document.querySelector('name').innerText=uname
    document.querySelector('[name="username"]').value=uname
    document.querySelector('[name="originalName"]').value=uname

	setTimeout(function(){

		popup.style.opacity = 1;
	},100)

}

document.querySelector('pnum').addEventListener("input", update)


function qDelete(row){
    quizurl = row.children[3].innerText
    fetch("/removeQuiz", {
        "headers": {
            "content-type": "application/json",
        },
        "body": JSON.stringify({quizurl:quizurl}),
        "method": "POST"
    });
    row.parentElement.removeChild(row)
}