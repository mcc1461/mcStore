("use strict");
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const router = require("express").Router();

/* ------------------------------------------------------- */
// routes/auth:

const auth = require("../controllers/authController");

// URL: /auth
router.post("/register", auth.register); // Register User
router.post("/login", auth.login); // SimpleToken & JWT
router.post("/refresh", auth.refresh); // JWT Refresh
router.get("/logout", auth.logout); // SimpleToken Logout

/* ------------------------------------------------------- */
module.exports = router;
