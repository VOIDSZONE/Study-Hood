const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    const { gender, dateOfBirth, about, contactNumber } = req.body;

    const id = req.user.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        messsage: "Id is required",
      });
    }

    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;

    const profileDetails = await Profile.findById(profileId);

    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    await profileDetails.save();

    return res.status(200).json({
      success: true,
      messsage: "Profile Updated successfully",
      profileDetails,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messsage: "Error while updating the profile",
      error: err.messsage,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;

    const userDetails = await User.findById(id);

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        messsage: "User not found",
      });
    }

    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    await User.findByIdAndDelete({ _id: id });

    return res.status(200).json({
      success: true,
      messsage: "User Deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messsage: "Error while deleting the user",
      error: err.messsage,
    });
  }
};

exports.getAllUserProfileDetails = async (req, res) => {
  try {
    const id = req.user.id;

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      messsage: "User Profile Data Fetched  successfully",
      userDetails,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messsage: "Error while fetching the user profile data",
      error: err.messsage,
    });
  }
};
