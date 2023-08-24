const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, timeDuration, description } = req.body;

    const video = req.files.videoUrl;

    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const uploadedDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadedDetails.secure_url,
    });

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    ).populate("subSection");

    return res.status(200).json({
      success: true,
      message: "Sub Section Created Successfully",
      updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while creating the sub section",
      err: error.message,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { subSectionId, title, description, timeDuration } = req.body;

    const video = req.files.videoUrl;

    if (!subSectionId) {
      return res.status(400).json({
        success: false,
        message: "Please fill the required fields",
      });
    }

    const subSection = await SubSection.findByIdAndUpdate(
      { _id: subSectionId },
      {
        title: title,
        description: description,
        timeDuration: timeDuration,
        videoUrl: video,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Sub Section Updated Successfully",
      subSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while updating the sub section",
      err: error.message,
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId } = req.params;

    await SubSection.findByIdAndDelete(subSectionId);

    return res.status(200).json({
      success: true,
      message: "Sub Section Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting the sub section",
      err: error.message,
    });
  }
};
