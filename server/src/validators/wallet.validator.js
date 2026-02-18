// src/validators/wallet.validator.js
const { body } = require("express-validator");

const amountRules = [
  body("amount")
    .exists().withMessage("amount is required")
    .isFloat({ gt: 0 }).withMessage("amount must be > 0"),
];

module.exports = { amountRules };
