const AdminModel = require('../../database/models/Admin');
const { createToken } = require('../../middleware/Middleware');
const bcrypt = require("bcrypt");

exports.createAdminLogin = async (req, res) => {
    const { phoneNumber, password } = req.body;
    console.log(req.body);
    try {
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ error: "invalid password" });
        }
        const userExist = await AdminModel.findOne({ phoneNumber });

        if (!userExist) {
            const hash = await bcrypt.hash(password, 10);
            await AdminModel.create({
                phoneNumber: req.body.phoneNumber,
                password: hash
            });
            console.log(req.body);
            res.json("User Registered");
        } else {
            res.json("User already exists");
        }
    } catch (err) {
        console.error("Error in createAdminLogin:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.LoginAdmin = async (req, res, next) => {
    const { phoneNumber, password } = req.body;
    try {
        if (!password) {
            throw new Error("Password is required");
        }

        const user = await AdminModel.findOne({ phoneNumber });
        if (!user) {
            throw new Error("User does not exist");
        }

        const dbpassword = user.password;
        const match = await bcrypt.compare(password, dbpassword);

        if (!match) {
            throw new Error("Password does not match");
        } else {
            const accessToken = createToken(user);
            res.cookie("access-token", accessToken, { maxAge: 60 * 60 * 24 * 365 * 1000 });
            res.json({ success: true, accessToken });
        }
    } catch (error) {
        next(error);
    }
};

exports.getAdmin = async (req, res) => {
    try {
        const users = await AdminModel.find({});
        res.json(users);
    } catch (error) {
        console.error("Error in getUser:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
