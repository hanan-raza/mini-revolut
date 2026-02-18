const router = require("express").Router();
const walletController = require("../controllers/wallet.controller");
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate");
const { amountRules } = require("../validators/wallet.validator");

router.get("/balance", auth, walletController.getBalance);
router.post("/deposit", auth, amountRules, validate, walletController.deposit);
router.post("/withdraw", auth, amountRules, validate, walletController.withdraw);

module.exports = router;
