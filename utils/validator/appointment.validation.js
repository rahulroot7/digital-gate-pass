const { body } = require("express-validator");

module.exports = {
  createAppointment: [
    body("date")
      .notEmpty().withMessage("Date is required")
      .isISO8601().withMessage("Date must be a valid date format (YYYY-MM-DD)"),

    body("time")
      .notEmpty().withMessage("Time is required")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Time must be in HH:MM format")
      .customSanitizer(value => (typeof value === 'string' ? value.replace(/\s+/g, " ").trim() : value)),

    body("organization_id")
      .notEmpty().withMessage("Organization ID is required")
      .isInt({ min: 1 }).withMessage("Organization ID must be a positive integer"),

    body("department_id")
      .notEmpty().withMessage("Department ID is required")
      .isInt({ min: 1 }).withMessage("Department ID must be a positive integer"),

    body("designation_id")
      .notEmpty().withMessage("Designation ID is required")
      .isInt({ min: 1 }).withMessage("Designation ID must be a positive integer"),

    body("visiting_officer_id")
      .notEmpty().withMessage("Visiting Officer ID is required")
      .isInt({ min: 1 }).withMessage("Visiting Officer ID must be a positive integer"),

    body("meeting_purpose")
      .notEmpty().withMessage("Meeting purpose is required")
      .isLength({ min: 3, max: 200 }).withMessage("Meeting purpose must be between 3 and 200 characters")
      .customSanitizer(value => (typeof value === 'string' ? value.replace(/\s+/g, " ").trim() : value)),
  ],
};