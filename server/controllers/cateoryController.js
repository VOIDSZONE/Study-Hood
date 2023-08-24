const Category = require("../models/Category");

//Create category Handler

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        messsage: "All fields are required",
      });
    }

    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    console.log(categoryDetails);

    return res.status(200).json({
      success: true,
      messsage: "category created successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messsage: "Error while creating the Category",
      error: err.messsage,
    });
  }
};

//Get All Category

exports.getAllCategory = async (req, res) => {
  try {
    const allCategory = await Category.find(
      {},
      { name: true, description: true }
    );

    return res.status(200).json({
      success: true,
      messsage: "Successfully fetched the Category",
      allCategory,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messsage: "Error while getting the Category",
      error: err.messsage,
    });
  }
};
