// Export both functions separately
async function aadharSendOtp(aadharNumber) {
    try {
      // TODO: aadhar API intigration dending
        // Replace this with Twilio, MSG91, etc.
        console.log(`Sending OTP to Aadhar ${aadharNumber}`);
        const success = true;

        if (success) {
        return { success: true };
        } else {
        return { success: false, message: 'SMS API failed' };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function aadharVerifyOtp(referenceId, otp) {
  try {
    console.log(`Verifying OTP for Aadhar Number: ${referenceId}, OTP: ${otp}`);
    const success = true;
    if (success) {
      return {
        success: true,
        data: {
          dob: "2005-08-11",
          gender: "Male",
          name: "Rahul Robert",
          mobile_number: "9876543212",
          image: "base64encodedstring...",
          address: "123, Noida, Uttar Pradesh, India",
          aadhaar_zip: "abc123xyz",
          share_code: "4321"
        }
      };
    } else {
      return { success: false, message: "SMS API failed" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = { aadharSendOtp, aadharVerifyOtp};
