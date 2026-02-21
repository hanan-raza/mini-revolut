const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const { register, login, googleLogin } = require("../controllers/auth.controller");
router.post("/google", asyncHandler(googleLogin));

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));

module.exports = router;