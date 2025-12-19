//This middleware checks from user's cookies if cart is empty, then do not allow the user to access checkout page
async function cartNotEmpty(req, res, next) {
  if (!req.cookies.cart || req?.cookies?.cart?.length === 0) {
    req.flash("danger", "Checkout page cannot be accessed with an empty cart");
    return res.redirect("/");
  }
  next();
}

module.exports = cartNotEmpty;
