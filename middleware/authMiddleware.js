exports.isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/auth/login');
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        res.status(403).send('Access denied. You do not have admin privileges.');
    }
};

exports.isTeacher = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'teacher') {
        return next();
    } else {
        res.status(403).send('Access denied. You do not have teacher privileges.');
    }
};
