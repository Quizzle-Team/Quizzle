//give the questions some colors
document.querySelectorAll('.hold>h1').forEach(e=>{
    qid = e.getAttribute("qid")
    color = `hsl(${Math.random() * 360}deg, 60%, 50%)`
    e.style.color = color
    document.querySelectorAll(`[questionid='${qid}']`).forEach(q=>{
        q.style.background = color
    })
})



function glow(qid, color=undefined){

    if (color==undefined){
        
        document.querySelectorAll(`[qid="${qid}"]`).forEach(e=>{
            e.style.textShadow = "0 0 20px currentColor";
        })
        
        document.querySelectorAll(`[questionid="${qid}"]`).forEach(e=>{
            e.style.boxShadow = "0 0 20px 3px "+e.style.backgroundColor;
        })
        
        
        setTimeout(function(){
            document.querySelectorAll(`[qid="${qid}"]`).forEach(e=>{
                e.style.textShadow = "";
            })
            
            document.querySelectorAll(`[questionid="${qid}"]`).forEach(e=>{
                e.style.boxShadow = "";
            })
        },500)
    }

    else {
        document.querySelectorAll(`[qid="${qid}"]`).forEach(e=>{
            e.style.textShadow = "0 0 20px"+color;
        })
        
        document.querySelectorAll(`[questionid="${qid}"]`).forEach(e=>{
            e.style.boxShadow = "0 0 20px 3px "+color;
        })
        as
        
        
        setTimeout(function(){
            document.querySelectorAll(`[qid="${qid}"]`).forEach(e=>{
                e.style.textShadow = "";
            })
            
            document.querySelectorAll(`[questionid="${qid}"]`).forEach(e=>{
                e.style.boxShadow = "";
            })
        },500)
    }


}
   


quiz = document.location.href.split('/').slice(-1)[0];
window.addEventListener("beforeunload", callback, {capture: true});
  

domain = location.hostname;
portnum = 8000;
var webSock = new WebSocket(`ws://${domain}:${portnum}/quizSocket`);

function startKeepAliveLoop(){
    loopInterval = setInterval(function(){
        webSock.CLOSED ? clearInterval(loopInterval) : webSock.send("KEEPALIVE")
    },20*1000)
}

function closeDialog(){
    document.querySelector(".popup-darken").classList.toggle("invis")
    scoreDiv = document.getElementsByClassName('score')[0];
    scoreDiv.style.marginTop = '10px';
    setTimeout(function(){
        scoreDiv.style.marginTop='0';
        scoreDiv.style.opacity='0';
        setTimeout(function(){
            scoreDiv.parentNode.removeChild(scoreDiv);
        },200)
    },200)
}

function callback(event){
    event.preventDefault();
    return event.returnValue = "Are you sure you want to quit?";
}

function eoq(){
    webSock.send("EOQ")

    webSock.onmessage = function(results){
        results = results.data;
        if (results.split('|')[0] == "SCORE"){
            console.log("SCORE : " + results)
            webSock.close()
            document.querySelectorAll("button").forEach(element => {
                element.disabled = true;
            })

            window.removeEventListener("beforeunload",callback)
            center = document.getElementsByTagName("content")[0];
            center.innerHTML = "<div class='score' style='opacity:0;'></div>\n"+center.innerHTML;
            setTimeout(function(){
                results = results.split('|')[1]
                scoreDiv = document.getElementsByClassName('score')[0];
                quiz = document.getElementsByTagName('h1')[0].innerText;

                scoreDiv.innerHTML = `
                <img src="/x.svg" onclick="closeDialog()" style="
                    width: 10%;
                    position: fixed;
                    right: 0;
                    cursor: pointer;
                    top: 0;
                ">
                <h1 style='padding-top:5px'>${quiz}</h1>
                <div class='sep'></div>
                <h2>You got ${results.split('/')[0]} correct out of ${results.split('/')[1]} questions!</h2>
                <div class='sep'></div>
                <h1>SCORE</h1>
                <h2>${((parseInt(results.split('/')[0])/parseInt(results.split('/')[1]))*100).toFixed(2)}% correct!</h2>
                <div class='sep'></div>
                `

                document.querySelector(".popup-darken").classList.toggle("invis")

                scoreDiv.style.opacity = 1;
                setTimeout(function(){
                    scoreDiv.style.marginTop = '10px';

                    setTimeout(function(){
                        scoreDiv.style.marginTop='0';
                    },200)
                },200)
                

            },200)
        }

        else {
            if (results.split('|')[0] == "processed"){
                glow(results.split('|')[1])
            }
    
        }

    }
}

webSock.onopen = async function(){
    webSock.send(quiz)
    startKeepAliveLoop()
}
webSock.onmessage = function(data){
    data = data.data;
    if (data.split('|')[0] == "processed"){
        glow(data.split('|')[1])
    }
    
    else if (data == "I kept you alive!"){
        console.log("Keepalive Success!")
    }


    else {
        console.log("error!!!!!")
    }

}
function process(element){
    qid = element.getAttribute('questionid');
    var e = new XMLHttpRequest();
    domain = location.hostname;
    portnum = 8000;
    webSock.send(`${qid}|${btoa(element.innerText)}`)
    
    
    console.log(element.innerText)
}

