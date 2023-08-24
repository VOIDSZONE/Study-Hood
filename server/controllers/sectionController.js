const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Please fill the required fields",
      });
    }

    const newSection = await Section.create({ sectionName });

    const updatedSectionDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    ).populate("courseContent");

    return res.status(200).json({
      success: true,
      message: "Section Created Successfully",
      updatedSectionDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while creating the section",
      err: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;

    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Please fill the required fields",
      });
    }

    const section = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { sectionName: sectionName },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section Updated Successfully",
      section,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while updating the section",
      err: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    await Section.findByIdAndDelete(sectionId);

    return res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting the section",
      err: error.message,
    });
  }
};
