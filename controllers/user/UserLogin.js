const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  SECRET_KEY,
  ACCESS_TOKEN,
  ExpirationInMilliSeconds,
} = require("../../constants/Constants");
const UserModel = require("../../database/models/customer");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.signup = async (req, res, next) => {
  let { userName, phoneNumber, email, password } = req.body;
console.log("body",req.body);
  try {
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ phoneNumber });
    if (existingUser) {
      const error = new Error(
        "Invalid User with provided phonenumber already exists entered!"
      );
      error.statusCode = 409;
      throw error;
    } else {
      // Generate salt
      const salt = await bcrypt.genSalt(10);
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new UserModel({
        userName,
        phoneNumber,
        email,
        password: hashedPassword,
      });
    
      const savedUser = await newUser.save();

      console.log("savedUser", savedUser);
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: savedUser._id,
          phoneNumber: savedUser.phoneNumber,
          userName: savedUser.userName,
        },
        SECRET_KEY
      );

      res
        .cookie(ACCESS_TOKEN, token, {
          httpOnly: true,
          maxAge: ExpirationInMilliSeconds, //2days
        })
        .status(200)
        .json({
          message: "Signup Successful",
          data: {
            userId: savedUser._id,
            phoneNumber: savedUser.phoneNumber,
            userName: savedUser.userName,
          },
        });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.login = async (req, res, next) => {
  let { phoneNumber, password } = req.body;

  if (phoneNumber === "" || password === "") {
    const error = new Error("Empty credentials supplied");
    error.statusCode = 454;
    throw error;
  } else {
    try {
      const user = await UserModel.findOne({ phoneNumber });
      if (!user) {
        const error = new Error("User Not Available Please Signup to continue");
        error.statusCode = 401;
        throw error;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        const error = new Error("Invalid credentials entered!");
        error.statusCode = 400;
        throw error;
      }

      if (user.role !== "customer") {
        const error = new Error("Invalid credentials entered!");
        error.statusCode = 500;
        throw error;
      }

      var userObj = {
        userId: user._id,
        phoneNumber: user.phoneNumber,
        userName: user.userName,
      };

      const token = jwt.sign(userObj, SECRET_KEY);

      res.cookie(ACCESS_TOKEN, token, {
        httpOnly: true,
        maxAge: ExpirationInMilliSeconds, //2 days
      });

      res.status(200).json({
        message: "Signin successful",
        data: userObj,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
};
