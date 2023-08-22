const OtpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/User");
const OTP = require("../models/Otp");
const Profile = require("../models/Profile");

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    //Checking if user is already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User already registered.",
      });
    }

    //Generating otp for the user
    let otp = OtpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const otpBody = await OTP.create({ email, otp });
    console.log(otpBody);

    //Sending response
    res.status(200).json({
      success: true,
      message: "Otp send successfully !!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error while sending otp",
      error: err.message,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //Validating the fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      confirmPassword ||
      otp
    ) {
      return res.status(403).json({
        success: false,
        message: "Please fill the required fields",
      });
    }

    //Checking password match with the confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password is not matching. Please Try Again",
      });
    }

    //Checking if user is already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User already registered.",
      });
    }

    //Fetching the recent otp for the email
    const recentOtp = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    //Validating otp
    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Otp not found",
      });
    }

    if (recentOtp.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP !!",
      });
    }

    //Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      contactNumber: null,
      about: null,
    });

    //Entry of the user
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: "User created Successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error while signing up user",
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Please fill the required fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered. Please sign up first.",
      });
    }

    //JWT generation after password match
    if (await bcrypt.compare(user.password !== password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "3h",
      });

      user.token = token;
      user.password = undefined;

      //Creating a cookie and sending response
      const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "User Logged In Successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error while logging the user",
      error: err.message,
    });
  }
};
