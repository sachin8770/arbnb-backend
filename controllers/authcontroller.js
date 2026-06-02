import { check, validationResult } from "express-validator";
import bcrypt from "bcryptjs";

import Home from "../models/home.js";
import { User } from "../models/user.js";

import { asyncHandler } from "../utils/handeltrycatch.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { v2 as cloudinary } from "cloudinary";

const generateAccessAndRefereshTokens = async (userId) => {
  try {

    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const postlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if ([email, password].some((data) => data.trim() === "")) {
      throw new Error("field can not be empty");
    }

    if (!email.includes("@")) {
      throw new Error("please enter the valid email");
    }

    const user = await User.findOne({ email });

    // EDITED: check user before password check
    if (!user) {
      throw new Error("user does not exist");
    }

    // EDITED: user method should be called on found user, not videomodel
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new Error("password is incorrect");
    }

    
    const { accessToken, refreshToken } =
      await generateAccessAndRefereshTokens(user._id);

  
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    console.log(accessToken, refreshToken);
    console.log(loggedInUser);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "user logged in successfully"
        )
      );
  } catch (err) {
    console.log("error while login", err);

    // EDITED: json takes only one argument
    res.status(402).json({
      message: "error while login",
      error: err.message,
    });
  }
};
const postsignup = async (req, res,next) => {
  try {
    const { email, password, fullName ,role} = req.body;

    if ([email, password, fullName].some((data) => data.trim() === "")) {
      throw new Error("Field can not be empty");
    }

    if (!email.includes("@")) {
      throw new Error("Please enter a valid email");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("User already exists");
    }

    if (
      !(
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password) &&
        password.length >= 8
      )
    ) {
      throw new Error("Please use valid credentials");
    }

    const user = new User({
      email,
      password,
      fullName,
      role
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (err) {
    console.log("error while signup", err);

    res.status(400).json({
      message: "error while signup",
      error: err.message,
    });
  }
};
const getloggineduser = asyncHandler(async (req, res) => {

  const id = req.user._id;


  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: user,
      },
      " user fetched successfully"
    )
  );
});
const logoutUser = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  console.log("userloghgedoit successfully");
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

export {
  postlogin,
  postsignup,
  logoutUser,
  getloggineduser
};
