const mongoose = require("mongoose")

const JewelleryCollectionSchema = new mongoose.Schema({
    name: String,
    image: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },

});
const JewelleryCollectionModel = mongoose.model('JewelleryCollection', JewelleryCollectionSchema);

module.exports = JewelleryCollectionModel