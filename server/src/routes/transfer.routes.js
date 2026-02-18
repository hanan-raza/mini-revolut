const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { transferRules } = require("../validators/transfer.validator");
const { transfer } = require("../controllers/transfer.controller");

router.post(
  "/",
  auth,
  transferRules,
  validate,
  asyncHandler(transfer)
);

module.exports = router;
