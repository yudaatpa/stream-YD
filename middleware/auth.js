// middleware/auth.js
module.exports.ensureAuth = (req, res, next) => {
  if (req.session && req.session.loggedIn) return next();
  return res.redirect('/login');
};
