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
            //and swap it with the current element
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    },
    base64enc : function(str) {return Buffer.from(str).toString('base64');},
    base64dec : function(str){return Buffer.from(str, 'base64').toString('ascii')},
    isClean : function(str){
        _clean = true
        matchList = ["/", "\\.\\.", "%2F", "%2E%2E", "%5C"]
        matchList.forEach(match=>{
            if (str.match(match) != null){
                _clean = false
            }
        })
        return _clean
    },
    clean : function(str){ //prevents hpp, since js isnt type strict and allows me to try string stuff on arrays causing the whole thing to crash
        if (str.constructor == Object)str = JSON.stringify(str)
        typeof str=='object' ? str = str.toString() : null; 

        return str;
    },
    createUnique : function(){
        return crypto.randomUUID().toString().toUpperCase();
    }


}