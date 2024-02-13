/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const mongoose = require("mongoose");
const path = require("path");

const JewelleryCollection = require("../../database/models/JewelleryCollection");
const { deleteFromS3, uploadToS3 } = require("../../config/s3Config");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
// exports.createJewelleryCollection = async (req, res, next) => {
//     try {
//         const { name, description } = req.body
//         // const image = req.file
//         var newCategoryDoc = await JewelleryCollection.create({
//             name, description
//         })
//         // const formData = req.body;
//         // console.log(req.body);
//         // var categoryImageS3Location = req.file;

//         // if (!categoryImageS3Location) {
//         //     throw new Error("Category image is required");
//         // }

//         // const existCategory = await JewelleryCollection.findOne({
//         //     name: { $regex: new RegExp(formData.name, "i") },
//         // });

//         // if (existCategory) {
//         //     throw new Error("Category with this name already exists");
//         // }

//         // var newCategoryDoc = await JewelleryCollection.create({
//         //     // image: categoryImageS3Location.location,
//         //     description: formData.description,
//         //     name: formData.name.trim(),
//         // });
//         console.log(newCategoryDoc);

//         res.json(newCategoryDoc);
//     } catch (error) {
//         if (req.file) {
//             await deleteImageFromS3(req.file.key);
//         }
//         next(error);
//     }
// };

exports.createJewelleryCollection = async (req, res, next) => {
  try {
    const formData = req.body;

    var collectionImageS3Location = req.file;

    if (!collectionImageS3Location) {
      throw new Error("menu image is required");
    }

    var newJewelleryCollectionDoc = await JewelleryCollection.create({
      name: formData.name.trim(),
      description: formData.description.trim(),
      image: collectionImageS3Location.location,
    });

    res.json({
      data: newJewelleryCollectionDoc,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

const validateAndCreateJewelleryCollection = async (name, description) => {
  if (name.length >= 5 && hasMoreThanOneWord(description)) {
    const newCategoryDoc = await JewelleryCollection.create({
      name,
      description,
    });
    return newCategoryDoc;
  } else {
    throw new Error("Invalid data");
  }
};
const hasMoreThanOneWord = (str) => {
  const words = str.split(/\s+/);
  return words.length > 1;
};

exports.validateAndCreateJewelleryCollection = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    console.log("Received data:", name, description);
    const newCategoryDoc = await validateAndCreateJewelleryCollection(
      name,
      description
    );
    console.log("Validation and creation successful:", newCategoryDoc);
    res.json(newCategoryDoc);
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ error: error.message });
  }
};
/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.updateJewelleryCollection = async (req, res, next) => {
  try {
    const JewelleryCollectionId = req.params.JewelleryCollectionId;
    if (!JewelleryCollectionId) {
      const error = new Error("collection ID is required");
      error.statusCode = 411;
      throw error;
    }
    const formData = req.body;
    if (!formData) {
      const error = new Error("formData not found");
      error.statusCode = 446;
      throw error;
    }

    var jewelleryCollectionImageS3Location = req.file;

    const existJewelleryCollection = await JewelleryCollection.findOne({
      _id: { $ne: JewelleryCollectionId },
      name: { $regex: new RegExp(formData.name, "i") },
    });

    if (existJewelleryCollection) {
      throw new Error("Collection with this name already exists");
    }

    var updatedFields = {
      name: formData.name.trim(),
      description: formData.description,
    };

    if (jewelleryCollectionImageS3Location && jewelleryCollectionImageS3Location.location) {
      updatedFields.image = jewelleryCollectionImageS3Location
        ? jewelleryCollectionImageS3Location.location
        : null;
    }

    const existingCollection = await JewelleryCollection.findByIdAndUpdate(
      JewelleryCollectionId,
      { $set: updatedFields },
      { new: true }
    );

    if (formData.categoryRemoveImage) {
      const decodedPath = decodeURIComponent(formData.categoryRemoveImage);
      var key = path.basename(decodedPath);
      await deleteImageFromS3(key);
    }

    res.json(existingCollection);
  } catch (error) {
    if (req.file) {
      await deleteImageFromS3(req.file.key);
    }
    next(error);
  }
};

const deleteImageFromS3 = async (key) => {
  try {
    if (key) {
      await deleteFromS3(key);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.getJewelleryCollection = async (req, res, next) => {
  try {
    const collections = await JewelleryCollection.find();
    res.json(collections);
  } catch (error) {
    error = new Error("Error get All collections");
    error.statusCode = 513;
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.deleteJewelleryCollection = async (req, res, next) => {
  try {
    const { JewelleryCollectionId } = req.params;

    if (!JewelleryCollectionId) {
      const error = new Error("collection ID is required");
      error.statusCode = 418;
      throw error;
    }

    const collection = await JewelleryCollection.findById(
      JewelleryCollectionId
    );

    if (!collection) {
      const error = new Error("collection is not found");
      error.statusCode = 419;
      throw error;
    }
    const { image } = collection;

    const deleteResult = await JewelleryCollection.deleteOne({
      _id: JewelleryCollectionId,
    });

    if (deleteResult.acknowledged == false && deleteResult.deletedCount <= 0) {
      const error = new Error("Error while delete jewellery collection");
      error.statusCode = 521;
      throw error;
    }
    if (image) {
      const decodedPath = decodeURIComponent(image);
      var key = path.basename(decodedPath);
      await deleteImageFromS3(key);
    }
    res.json(deleteResult);
  } catch (error) {
    console.log("168", error);
    error = new Error("Error deleting jewellery collection");
    error.statusCode = 532;
    next(error);
  }
};
