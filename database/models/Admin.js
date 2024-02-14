const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },

});

const AdminModel = mongoose.model("Admin", userSchema);

module.exports = AdminModel;