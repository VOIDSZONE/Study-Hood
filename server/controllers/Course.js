const Course = require("../models/Course");
const Tags = require("../models/Tags");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

require("dotenv").config();

exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    const thumbnail = req.files.thumbnailImage;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details not found",
      });
    }

    const tagDetails = await Tags.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag Details not found",
      });
    }

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    await User.findByIdAndUpdate(
      { id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    await Tags.findByIdAndUpdate(
      { id: tagDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while creating the course",
      err: error.message,
    });
  }
};

// Get All Courses

exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({});

    return res.status(200).json({
      success: true,
      message: "All Courses Fetched Successfully",
      allCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching the course",
      err: error.message,
    });
  }
};
