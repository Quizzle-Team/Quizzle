const fs = require('fs');
const path = require('path');

function authenticate(username, hash){
    accounts = JSON.parse(fs.readFileSync(path.join(__dirname, '../users.json'), 'utf8'));
    return accounts[username]==hash;
}


module.exports = authenticate;
