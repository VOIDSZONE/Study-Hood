const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//create Ratings

exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rating, review, courseId } = req.body;

    //check user enrolled in the course or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentEnrolled: {
        $elemMatch: {
          $eq: userId,
        },
      },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `User is not enrolled in this course`,
      });
    }

    //check if user is already reviewed or not
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (!alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: `User has already reviewed this course`,
      });
    }

    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      user: userId,
      course: courseId,
    });

    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReview: ratingReview._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Rating and review created successfully`,
      ratingReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Average Rating

exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.body;

    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    //No rating review exists
    return res.status(200).json({
      success: true,
      message: "Average Rating is 0, no rating review found",
      averageRating: 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get All Ratings

exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "$desc" })
      .populate({
        path: "user",
        select: "firstName, lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      allReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
