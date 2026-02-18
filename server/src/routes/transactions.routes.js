const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { listTransactions } = require("../controllers/transactions.controller");

router.get("/", auth, asyncHandler(listTransactions));

module.exports = router;
