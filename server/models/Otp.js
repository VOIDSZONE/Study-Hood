const mongoose = require("mongoose");
const mail = require("../utils/Mail");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  otp: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

const sendVerificationMail = async (email, otp) => {
  try {
    const mailResponse = await mail(
      email,
      "Verification code from StudyHood",
      otp
    );
    console.log("Mail Send Successfully", mailResponse);
  } catch (error) {
    console.log("Error while sending verification otp");
    console.error(error);
  }
};

otpSchema.pre("save", async function (next) {
  await sendVerificationMail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", otpSchema);
