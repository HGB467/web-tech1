//This middleware checks if user is authenticated (req.session.user exists) and only then allows to proceed to the routes accessable to logged in users only
async function checkSessionAuth(req, res, next) {
  if (!req.session.user) {
    req.flash("danger", "You need to login for this route");
    return res.redirect("/login");
  }
  next();
}

module.exports = checkSessionAuth;
