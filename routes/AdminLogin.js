var express = require("express");
var router = express.Router();

const userAdminRouter = require("../controllers/admin/AdminLogin");


const use = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

//Admin
router.post("/login", use(userAdminRouter.LoginAdmin));
router.post("/register", use(userAdminRouter.createAdminLogin));

router.get("/getRegisteredUser", use(userAdminRouter.getAdmin))




module.exports = router;