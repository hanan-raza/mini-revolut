const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { getDashboard } = require("../controllers/dashboard.controller");

router.get("/", auth, asyncHandler(getDashboard));

module.exports = router;
