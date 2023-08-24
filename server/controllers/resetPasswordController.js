const bcrypt = require("bcrypt");
const User = require("../models/User");
const mail = require("../utils/Mail");

//Reset Password Token

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your Email is not registered.",
      });
    }

    const token = crypto.randomUUID();

    await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    const url = `http://localhost:3000/reset-password/${token}`;

    await mail(email, "Password Reset Link", `Password Reset Link: ${url}`);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully. Please check email and reset password",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: "Something went wrong while reseting the password.",
    });
  }
};

// Reset Password

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Password and Confirm Password not matching",
      });
    }

    const userDetails = await User.findOne({ token });

    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

    if (userDetails.resetPasswordExpires < Date.now) {
      return res.status(401).json({
        success: false,
        message: "Token is expired.Please regenrate the token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reseting the password with link",
    });
  }
};
