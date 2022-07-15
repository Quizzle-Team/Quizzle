crypto = require('crypto')

module.exports = {
    hash : function(string){
        return crypto.createHash('sha256').update(string).digest('hex')
    },
    shuffle : function(array) { //Fisher–Yates shuffle
        let currentIndex = array.length,  randomIndex;
        //while there are elements
        while (currentIndex != 0) {
            //pick a random element
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            //and swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    },
    randColor : function(){
        color = Math.floor(Math.random()*16777215)
        color<5592405 ? color += (5592405-color)*2:null
        color= "#"+color.toString(16).toString()
        return color
    },
    base64enc : function(str) {return Buffer.from(str).toString('base64');},
    base64dec : function(str){return Buffer.from(str, 'base64').toString('ascii')},
    isClean : function(str){
        matchList = ["/", "\\.\\.", "%2F", "%2E%2E", "%5C"]
        matchList.forEach(match=>{
            if (str.match(match) != null){
                return false
            }
        })
        return true
    },
    clean : function(str){ //prevents hpp, since js isnt type strict and allows me to try string stuff on arrays causing the whole thing to crash
        typeof str=='object' ? str = str[0] : null; 
        return str;
    },
    findQuiz : function(url){
        let json = fs.readFileSync("").toString()

        findUrl = '/quiz/ceeber'

        e = c.filter(function(data){
            return (data['url']==findUrl)
        })[0]
    }


}