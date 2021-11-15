require('dotenv').config()
const mysql = require('mysql')
const con = mysql.createConnection({
    connectionLimit : 10,
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER,
    password:process.env.DB_SECRET,
    database:process.env.DB_DB
})
con.connect(function(err){
    if(err) throw err;
    console.log(`Connected to sql DB`)
});

module.exports = con;