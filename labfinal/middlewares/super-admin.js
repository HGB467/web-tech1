//This middleware checks if the logged in user is an admin, if he is, only then allow to access the protected admin routes
module.exports = async function (req, res, next) {
  res.locals.layout = "super-admin-layout";
  res.locals.title = "Nova Admin";
  res.locals.currentPath = req.originalUrl;

  const isAdmin = res?.locals?.isAdmin

  if (!isAdmin) {
    if (req.flash) {
      req.flash("danger", "You do not have access to this area.");
    }
    return res.redirect("/login");
  }
  
  next();
};
