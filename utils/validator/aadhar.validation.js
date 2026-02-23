const { body } = require("express-validator");

module.exports = {
  aadharverification: [
    body("aadharNumber")
      .notEmpty().withMessage("Aadhar number is required")
      .isLength({ min: 12, max: 12 }).withMessage("Aadhar number must be 12 digits")
      .isNumeric().withMessage("Aadhar number must contain only numbers"),
  ],
  aadharVerify: [
    body("otp")
      .notEmpty().withMessage("OTP is required")
      .isLength({ min: 4, max: 4 }).withMessage("otp number must be 4 digits")
      .isNumeric().withMessage("OTP number must contain only numbers"),
  ],

  aadharOffline: [
    body("name")
      .notEmpty().withMessage("Name is required"),

    body("dob")
      .notEmpty().withMessage("Date of birth is required"),

    body("gender")
      .notEmpty().withMessage("Gender is required"),

    body("address")
      .notEmpty().withMessage("Address is required"),

    body("state_id")
      .notEmpty().withMessage("State ID is required"),

    body("city_id")
      .notEmpty().withMessage("City ID is required"),

    body("pin_code")
      .notEmpty().withMessage("PIN code is required")
      .isLength({ min: 6, max: 6 }).withMessage("Pin code must be 6 digits"),

    body("type_of_id")
      .notEmpty().withMessage("Type of ID is required"),

    body("id_image").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("Image is required");
      }
      return true;
    })
  ],
};
