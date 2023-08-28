const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mail = require("../utils/Mail");
const crypto = require("crypto");
const mongoose = require("mongoose");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");

exports.capturePayment = async (req, res) => {
  try {
    const { course_id } = req.body;
    const userId = req.user.id;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid course id",
      });
    }

    let course;

    try {
      course = await Course.findById(course_id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      //user is already enrolled
      const uid = new mongoose.Types.ObjectId(userId);

      if (course.studentEnrolled.includes(uid)) {
        return res.status(400).json({
          success: false,
          message: "Student is already enrolled",
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    //creation of order
    try {
      const paymentResponse = await instance.orders.create({
        amount: course.price * 100,
        currency: "INR",
        receipt: Math.random(Date.now()).toString(),
        notes: {
          courseId: course_id,
          userId,
        },
      });

      console.log(paymentResponse);

      return res.status(200).json({
        success: true,
        courseName: course.courseName,
        description: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.id,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        err: error.message,
        message: "Error while creating the order",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error while capturing the payment",
      error: err.message,
    });
  }
};

exports.verifySignature = async (req, res) => {
  try {
    const webhookSecret = "abcdefg";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));

    const digest = shasum.digest("hex");

    if (signature === digest) {
      const { courseId, userId } = req.body.payload.entity.notes;

      try {
        const enrolledCourse = await Course.findOneAndUpdate(
          { id: courseId },
          {
            $push: {
              studentEnrolled: userId,
            },
          },
          { new: true }
        );

        if (!enrolledCourse) {
          return res.status(500).json({
            success: false,
            message: "Course not found",
          });
        }

        console.log(enrolledCourse);

        const enrolledStudent = await User.findByIdAndUpdate(
          { id: userId },
          {
            $push: {
              courses: courseId,
            },
          },
          { new: true }
        );

        console.log(enrolledStudent);

        const emailResponse = await mail(
          enrolledStudent.email,
          "Congraltulations",
          "Youu have taken a new course"
        );

        console.log(emailResponse);

        return res.status(200).json({
          success: true,
          message: "Signature verified and Course Added",
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid Request",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifing the signature",
    });
  }
};
