const bcrypt = require('bcrypt');
const mysql = require('mysql'); // Make sure you have mysql package installed

const users = [
    { username: 'admin', password: 'root', role: 'admin', email: 'admin@gmail.com' },
    { username: 'teacher1', password: 'root', role: 'teacher', email: 'teacher1@gmail.com' },
    { username: 'teacher2', password: 'root', role: 'teacher', email: 'teacher2@gmail.com' },
];

async function hashPasswords() {
    for (const user of users) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    console.log(users);
    insertUsersIntoDatabase(users);
}

function insertUsersIntoDatabase(users) {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root', // Replace with your MySQL username
        password: 'root', // Replace with your MySQL password
        database: 'attendance_system' // Replace with your database name
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database: ' + err.stack);
            return;
        }
        console.log('Connected to database.');

        // Insert users into the database
        const sql = 'INSERT INTO users (username, password, role, email) VALUES ?';
        const values = users.map(user => [user.username, user.password, user.role, user.email]);

        connection.query(sql, [values], (error, results) => {
            if (error) {
                console.error('Error inserting users: ' + error.stack);
                return;
            }
            console.log('Users inserted: ', results.affectedRows);
        });

        connection.end();
    });
}

hashPasswords();
