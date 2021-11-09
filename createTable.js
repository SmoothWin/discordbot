require('dotenv').config();
const mysql = require('mysql');

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_SECRET,
  database: process.env.DB_DB
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
    con.query(`CREATE TABLE invite (
                  id int NOT NULL AUTO_INCREMENT,
                  inviter varchar(255),
                  invited varchar(255) NOT NULL,
                  PRIMARY KEY (id)
                  )`, (err, result) =>{
                    if(err) throw err;
                    console.log("Table created")
                  })
    con.end();
});