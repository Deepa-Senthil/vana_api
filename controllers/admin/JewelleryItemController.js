/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const JewelleryItems = require("../../database/models/JewelleryItems");
const JewelleryCollectionModel = require("../../database/models/JewelleryCollection");
const { mongoose } = require("mongoose");
const { uploadToS3, deleteFromS3 } = require("../../config/s3Config");
const path = require("path");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.createJewelleryItem = async (req, res, next) => {
  try {
    const formData = req.body;

    const images = req.files.filter((file) =>
      file.fieldname.startsWith("image")
    );
    const posterImage = req.files.find(
      (file) => file.fieldname === "posterImage"
    );

    const jewelleryCollectionIds = JSON.parse(formData.JewelleryCollection).map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const posterS3FileName = await uploadToS3(
      posterImage.buffer,
      posterImage.originalname,
      posterImage.mimetype
    );
    const posterImageUrl = `${process.env.BUCKET_URL}${posterS3FileName}`;

    const s3ImageUrls = await Promise.all(
      images.map(async (image) => {
        const s3FileName = await uploadToS3(
          image.buffer,
          image.originalname,
          image.mimetype
        );
        const url = `${process.env.BUCKET_URL}${s3FileName}`;
        return url;
      })
    );

    var newItemDoc = await JewelleryItems.create({
      title: formData.title,
      price: formData.price,
      images: s3ImageUrls,
      description: formData.description,
      netWeight: parseInt(formData.netWeight) ?? 0,
      posterURL: posterImageUrl,
      JewelleryCollection: jewelleryCollectionIds,
    });

    res.json({
      data: newItemDoc,
      success: true,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getAllJewelleryItems = async (req, res, next) => {
  const jewelleryItems = await JewelleryItems.aggregate([
    {
      $lookup: {
        from: "jewellerycollections",
        localField: "JewelleryCollection",
        foreignField: "_id",
        as: "JewelleryCollection",
      },
    },
    // { $unwind: "$JewelleryCollection" },
    {
      $project: {
        title: 1,
        images: 1,
        price: 1,
        description: 1,
        netWeight: 1,
        posterURL: 1,
        JewelleryCollection: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
        },
      },
    },
  ]);
  res.json(jewelleryItems);
};
/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.updateJewelleryItem = async (req, res, next) => {
  try {
    const JewelleryItemId = req.params.JewelleryItemId;
    const formData = req.body;

    const jewelleryCollectionIds = JSON.parse(formData.JewelleryCollection).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const images = req.files.filter((file) =>
      file.fieldname.startsWith("image")
    );
    const posterImage = req.files.find(
      (file) => file.fieldname === "posterImage"
    );

    if (!JewelleryItemId) {
      const error = new Error("JewelleryItemId is required");
      error.statusCode = 411;
      throw error;
    }

    if (!formData) {
      const error = new Error("formData not found");
      error.statusCode = 446;
      throw error;
    }

    var item = await JewelleryItems.findById(JewelleryItemId);

    if (!item._id) {
      const error = new Error("item is not found");
      error.statusCode = 459;
      throw error;
    }

    // Handle image removal
    const imagesToRemove = JSON.parse(formData.imagesToRemove || "[]");
    const remainingImages = item.images.filter(
      (img) => !imagesToRemove.includes(img)
    );

    if (imagesToRemove && imagesToRemove.length > 0) {
      for (const url of imagesToRemove) {
        if (url) {
          await deleteImageFromS3(url);
        }
      }
    }

    let posterImageUrl = item.posterURL;
    if (posterImage) {
      const posterS3FileName = await uploadToS3(
        posterImage.buffer,
        posterImage.originalname,
        posterImage.mimetype
      );
      posterImageUrl = `${process.env.BUCKET_URL}${posterS3FileName}`;
    }

    const s3ImageUrls = await Promise.all(
      images.map(async (image) => {
        const s3FileName = await uploadToS3(
          image.buffer,
          image.originalname,
          image.mimetype
        );
        var url = `${process.env.BUCKET_URL}${s3FileName}`;
        return url;
      })
    );

    const updatedImages = [...remainingImages, ...s3ImageUrls];

    var updatedFields = {
      _id: formData.id,
      title: formData.title,
      description: formData.description,
      images: updatedImages,
      netWeight: parseInt(formData.netWeight) ?? 0,
      price: formData.price,
      posterURL: posterImageUrl,
      JewelleryCollection: jewelleryCollectionIds,
    };

    const existingProduct = await JewelleryItems.findByIdAndUpdate(
      JewelleryItemId,
      { $set: updatedFields },
      { new: true }
    );

    res.json({
      data: existingProduct,
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const deleteImageFromS3 = async (url) => {
  try {
    if (url) {
      const decodedPath = decodeURIComponent(url);
      var key = path.basename(decodedPath);
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

exports.deleteJewelleryItem = async (req, res, next) => {
  try {
    const { JewelleryItemId } = req.params;
    const item = await JewelleryItems.findById(JewelleryItemId);
    const { images, posterURL } = item || {};

    if (!item) {
      const error = new Error("item not found");
      error.statusCode = 404;
      throw error;
    }

    const deleteResult = await JewelleryItems.deleteOne({
      _id: JewelleryItemId,
    });

    if (deleteResult.acknowledged == false && deleteResult.deletedCount <= 0) {
      const error = new Error("Error while delete product");
      error.statusCode = 521;
      throw error;
    }

    if (posterURL) {
      await deleteImageFromS3(posterURL);
    }

    if (images && images.length > 0) {
      for (const url of images) {
        if (url) {
          await deleteImageFromS3(url);
        }
      }
    }

    const success = deleteResult.acknowledged;
    const message = success
      ? "Item deleted successfully"
      : "Failed to delete Item";

    res.json({
      success: success,
      message: message,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.fetchJewelleryItemByJewelleryCollectionId = async (req, res, next) => {
  try {
    const JewelleryCollectionId = req.params.JewelleryCollectionId;
    const _JewelleryCollectionId = new mongoose.Types.ObjectId(
      JewelleryCollectionId
    );

    var categoryDoc = await JewelleryCollectionModel.findById({
      _id: _JewelleryCollectionId,
    });

    if (!categoryDoc) {
      const error = new Error("Category not found");
      error.statusCode = 452;
      throw error;
    }

    const categoryWithProducts = await JewelleryCollectionModel.aggregate([
      {
        $match: {
          _id: _JewelleryCollectionId,
        },
      },
      {
        $lookup: {
          from: "jewelleryitems",
          localField: "_id",
          foreignField: "JewelleryCollection",
          as: "AllJewelleryitems",
        },
      },
      {
        $unwind: "$AllJewelleryitems",
      },
      {
        $project: {
          _id: "$AllJewelleryitems._id",
          title: "$AllJewelleryitems.title",
          description: "$AllJewelleryitems.description",
          price: "$AllJewelleryitems.price",
          netWeight: "$AllJewelleryitems.netWeight",
          posterURL: "$AllJewelleryitems.posterURL",
          categoryName: "$name",
          JewelleryCollectionId: "$_id",
        },
      },
    ]);

    res.json(categoryWithProducts.length > 0 ? categoryWithProducts : []);
  } catch (error) {
    next(error);
  }
};
