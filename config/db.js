const mysql = require('mysql');

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: 'localhost',         // Replace with your database host
    user: 'root',              // Replace with your MySQL username
    password: 'AjainRock@44', // Replace with your MySQL password
    database: 'attendance_db'  // Replace with your database name
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

module.exports = db;
