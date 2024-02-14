const mongoose = require("mongoose");
const JewelleryCollectionModel = require("./JewelleryCollection");

const JewelleryItemSchema = new mongoose.Schema({
    title: String,
    images: [
        {
            type: String,
            required: false
        },
    ],
    price: Number,
    description: String,
    // netWeight: Number,
    posterURL: String,
    JewelleryCollection: [{ type: mongoose.Schema.Types.ObjectId, ref: JewelleryCollectionModel }],
});

const JewelleryItemModel = mongoose.model("JewelleryItem", JewelleryItemSchema);

module.exports = JewelleryItemModel;