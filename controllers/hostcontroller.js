import Home from "../models/home.js";

import {User} from "../models/user.js";
import fs from 'fs';
import { asyncHandler } from "../utils/handeltrycatch.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { v2 as cloudinary } from "cloudinary";
const getaddhome = (req, res, next) => {

  res.render('admin/addHome', { pageTitle: 'Add Home to airbnb', isLogined: req.isLogined, user: req.session.user });
};

const addFavouriteController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { homeId } = req.params;

    if (!homeId) {
      throw new ApiError(400, "Home ID is required");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const alreadyFavourite = user.favourites.some(
      (id) => id.toString() === homeId
    );

    if (alreadyFavourite) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            homeId,
            isFavourite: true,
          },
          "Already in favourites"
        )
      );
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        favourites: homeId,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          homeId,
          isFavourite: true,
        },
        "Added to favourites"
      )
    );
  } catch (err) {
    console.log("Error while adding favourite:", err);

    return res.status(err.statusCode || 500).json(
      new ApiResponse(
        err.statusCode || 500,
        null,
        err.message || "Error while adding favourite"
      )
    );
  }
};


const postaddhome = asyncHandler(async (req, res, next) => {

  const { name, price, location, rating } = req.body;


  if (!name || !price || !location || !rating) {
    throw new ApiError(400, "Fields can not be empty");
  }


  if (!req.file) {
    throw new ApiError(400, "Please upload a valid image");
  }

  console.log("Multer file received:", req.file);


  const cloudinaryResponse = await uploadOnCloudinary(req.file.path);


  if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
    throw new ApiError(500, "Image upload to Cloudinary failed");
  }

  console.log("Cloudinary image URL:", cloudinaryResponse.secure_url);


  const home = new Home({
    owner:req.user_id,
    name,
    price,
    location,
    rating,
    photo: cloudinaryResponse.secure_url,
  });

  console.log("before save");

  const savedHome = await home.save();

  console.log("after save");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        savedHome,
        "Home added successfully"
      )
    );
});
const HostHomeList = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find();

    res.render('store/home-list', { isLogined: req.isLogined, user: req.session.user, registeredHomes: registeredHomes, pageTitle: 'hosthomelist', currentpage: 'hosthomelist' });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error loading homes");
  }
};
const Edithome = (req, res, next) => {
  const homeId = req.params.homeid;
  const editing = req.query.editing === "true";

  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found for editing.");
      return res.redirect("/host/home-list");
    }
    console.log(home.photo);
    res.render("admin/edit-home", { home, isLogined: req.isLogined, user: req.session.user, pageTitle: "Edit your Home", currentPage: "host-homes", editing: editing });
  });
};
const editposthome = (req, res, next) => {
  const { id, name, price, location,rating} = req.body;
    console.log("came to edit post home");
   
  Home.findById(id)
    .then((home) => {
      home.name = name;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.photo=req.filename;   
     console.log(photo);

      return home.save();
    })
    .then((result) => {
      console.log("Home updated ", result);
      res.redirect('/host/home-list');
    })
    .catch((err) => {
      console.log("Error: ", err);
      res.status(500).send("Error updating home");
    });
};

const postdeleathome = (req, res, next) => {
  const homeId = req.params.homeid;
  console.log("Came to delete ", homeId);

  Home.findByIdAndDelete(homeId)
    .then((homes) => {
      return res.redirect('/gethomes');
    })
    .catch((error) => {
      console.log("Error while deleting ", error);
    });
};
const removeFavouriteController = async (req, res) => {
  try {
          console.log(req.user);
    const userId = req.user._id;
    const { homeId } = req.params;
         console.log(userId);
    if (!homeId) {
      throw new ApiError(400, "Home ID is required");
    }
  
    const user = await User.findById(userId);
      console.log(user);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await User.findByIdAndUpdate(userId, {
      $pull: {
        favourites: homeId,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          homeId,
        },
        "Removed from favourites"
      )
    );
  } catch (err) {
    console.log("Error while removing favourite:", err);

    return res.status(err.statusCode || 500).json(
      new ApiResponse(
        err.statusCode || 500,
        null,
        err.message || "Error while removing favourite"
      )
    );
  }
};

export const getHomeByIdController = asyncHandler(
  async (req, res) => {
    const { homeId } = req.params;

    if (!homeId) {
      throw new ApiError(400, "Home ID is required");
    }

    const home = await Home.findById(homeId);

    if (!home) {
      throw new ApiError(404, "Home not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        home,
        "Home fetched successfully"
      )
    );
  }
);


const addbookings = (req, res, next) => {
  const homeId = req.params.homeid;
  console.log("reached here");
  res.render('store/bookings', { isLogined: req.isLogined, user: req.session.user, homeId: homeId });
};

export {
  postaddhome,
  getaddhome,
  HostHomeList,
  addFavouriteController,
  Edithome,
  editposthome,
  postdeleathome,
  removeFavouriteController,
  addbookings,
};