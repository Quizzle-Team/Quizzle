function fSubmit(){

    input = document.createElement('input')
    input.setAttribute('type',"text")
    input.setAttribute('name',"quizname")
    input.id="quizname"
    input.value = document.querySelector('[contenteditable]').innerText
    document.body.querySelector('form').insertBefore(input, document.querySelector('h2:not([contenteditable])')) 
    document.body.querySelector('form').submit()
}


function createMoreChoices(qid){
    questionChoices = document.querySelectorAll("[name^='choice:"+qid+"']")
    console.log(questionChoices)

    e = questionChoices[0].cloneNode()
    



    e.name=`choice:${qid}:${questionChoices.length+1}`
    
    moreChoicesButton = document.querySelector(`[onclick="createMoreChoices(${qid})"]`)

    moreChoicesButton.parentNode.insertBefore(document.createElement('br'),moreChoicesButton) //create <br />
    
    moreChoicesButton.parentNode.insertBefore(e,moreChoicesButton) //append input option 
    
    moreChoicesButton.parentNode.insertBefore(document.createElement('br'),moreChoicesButton) //create <br />
}



/*

e = document.querySelectorAll("[name^='choice:']")
lastQ = parseInt(e[e.length-1].name.split(':')[1])


*/

function anotherQ(){

    form = document.getElementsByTagName("form")[0]
    e = document.querySelectorAll("[name^='choice:']")
    
    lastInput = e[e.length-1]
    console.log(lastInput)
    lastQ = lastInput.name.split(':')[1]
    console.log(lastQ)

    qToMake = parseInt(lastQ)+1
    div = document.createElement('div')
    
    div.innerHTML = `
        <div class="sep"></div>
        <h2>Question ${qToMake}</h2>
        <label>Optional Image Attachment</label>
        <div class="custom-file">
            <input type="file" class="custom-file-input" id="customFile" name="image:${qToMake}">
            <label class="custom-file-label" for="customFile">Choose file</label>
            <button type="button">Upload File!</button>
        </div>
        <input type="file" name="image:${qToMake}" />
        <input type="text" name="question:${qToMake}"> <br>
        <h4>Correct answer</h4>
        <input type="text" name="choice:${qToMake}:1:correct"> <br>
    
        <h4>Other answers</h4>
        <input type="text" name="choice:${qToMake}:2"> <br>
        <button type="button" onclick="createMoreChoices(${qToMake})">Add another choice</button>
        <div class="sep"></div>`
    
    form.insertBefore(div, form[form.length-2])
    
    

}