const Tags = require("../models/Tags");

//Create Tag Handler

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        messsage: "All fields are required",
      });
    }

    const tagDetails = await Tags.create({
      name: name,
      description: description,
    });

    console.log(tagDetails);

    return res.status(200).json({
      success: true,
      messsage: "Tag created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messsage: "Error while creating the tags",
      error: err.messsage,
    });
  }
};

//Get All Tags

exports.getAllTags = async (req, res) => {
  try {
    const allTags = await Tags.find({}, { name: true, description: true });

    return res.status(200).json({
      success: true,
      messsage: "Successfully fetched the tags",
      allTags,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messsage: "Error while getting the tags",
      error: err.messsage,
    });
  }
};
