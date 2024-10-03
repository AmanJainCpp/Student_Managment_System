const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getLogin = (req, res) => {
    res.render('login');
};

exports.postLogin = (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(400).send('User not found');
        }

        const user = result[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            req.session.user = { id: user.id, username: user.username, role: user.role };
            if (user.role === 'admin') {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/teacher/dashboard');
            }
        } else {
            res.status(400).send('Invalid credentials');
        }
    });
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};
