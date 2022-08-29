const fs = require('fs');
const path = require('path');
const pg = require('pg');
async function authenticate(username, hash, settings){
    const client = new pg.Client(settings)
    client.connect();
    const result = await client.query("SELECT * FROM users WHERE username = $1 AND pwdhash = $2", [username,hash])
    console.log(result.rowCount)
    return (result.rowCount != 0) //if rowcount not equal to 0, it exists and a match has been made
}


module.exports = authenticate;
