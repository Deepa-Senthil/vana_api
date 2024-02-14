const express = require("express");
const router = express.Router();

const customersController = require("../controllers/user/UserLogin");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

//User
router.post("/login", use(customersController.login));
router.post("/signup", use(customersController.signup));

module.exports = router;
