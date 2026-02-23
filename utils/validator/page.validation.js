const { body } = require("express-validator");

module.exports = {
  pageCreate: [
    body("title")
      .notEmpty().withMessage("Date is required"),

    body("content")
      .notEmpty().withMessage("Meeting purpose is required")
      .isLength({ min: 3 }).withMessage("Meeting purpose must be between 3 characters")
      .customSanitizer(value => (typeof value === 'string' ? value.replace(/\s+/g, " ").trim() : value)),
  ],
};