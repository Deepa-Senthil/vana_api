const mongoose = require("mongoose");
const JewelleryItemModel = require("../../database/models/JewelleryItems");


/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */




exports.getMyBag = async (req, res, next) => {
    const { JewelleryItemId } = req.params;
    try {
        // Convert the received ID to ObjectId
        const jewelleryItemId = new mongoose.Types.ObjectId(JewelleryItemId);
    
        // Query the database for the jewellery item
        const jewelleryItem = await JewelleryItemModel.findById(jewelleryItemId);
    console.log(jewelleryItem);
        // If no item is found, throw an error
        if (!jewelleryItem) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
        }
    
        // Extract relevant fields from the found jewellery item
        const { _id, posterURL, title, price } = jewelleryItem;
    
        // Send the extracted data as response
        res.json({ _id, posterURL, title, price });
          
    } catch (error) {
        // If any error occurs, pass it to the next middleware
        next(error);
    }
};


  