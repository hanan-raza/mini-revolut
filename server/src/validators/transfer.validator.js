// src/validators/transfer.validator.js
const { body } = require("express-validator");

const transferRules = [
  body("recipientEmail")
    .exists().withMessage("recipientEmail is required")
    .isEmail().withMessage("recipientEmail must be a valid email"),
  body("amount")
    .exists().withMessage("amount is required")
    .isFloat({ gt: 0 }).withMessage("amount must be > 0"),
];

module.exports = { transferRules };
