import Home from "../models/home.js";
import crypto from "crypto";

import Razorpay from "razorpay";


import {User} from "../models/user.js";
import fs from 'fs';
import { asyncHandler } from "../utils/handeltrycatch.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import  Booking  from "../models/bookings.js" 
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
  console.log(req.user._id);

 
  const { name, description, price, location } = req.body;


  if (!name || !description || !price || !location) {
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
    owner: req.user._id,
    name,

    // ADDED
    description,

    price,
    location,

    // REMOVED
    // rating,

    photo: cloudinaryResponse.secure_url,

    // OPTIONAL: not required because schema default handles it
    // isAvailable: true,
  });

  console.log("before save");

  const savedHome = await home.save();

  console.log("after save");

  return res.status(201).json(
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
const getMyBookings = async (req, res) => {
  try {
    if (!req.user) {
      throw new ApiError(
        400,
        "Please login first"
      );
    }

    const bookings = await Booking.find({
      guest: req.user._id, 
    }).populate("home");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const addbookings = async (req, res) => {
  try {
    const { homeid } = req.params;

    if (!homeid) {
      throw new ApiError(400, "Home id is required");
    }

   
    const home = await Home.findById(homeid);
 
    if (!home) {
      throw new ApiError(404, "Home not found");
    }
    //  const order = await razorpay.orders.create({
    //    amount: home.price * 100,
    //    currency: "INR",
    //  });
    const alradybooked = await Booking.findOne({
      guest: req.user._id,
      home: homeid,
    });

    if (alradybooked) {
      return res.status(200).json(
        new ApiResponse(
          200,
          alradybooked,
          "Home already booked by you"
        )
      );
    }

    const booking = await Booking.create({
      guest: req.user._id,
      home: homeid,

    
      owner: home.owner,
      amount: home.price,

    
      bookingStatus: "confirmed",
      paymentStatus: "pending",
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        booking,
        "Booking added successfully"
      )
    );
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getMyHomes = async (req, res) => {
  try {
    console.log(req.user._id);
    const homes = await Home.find({
      owner: req.user._id,
    });

    if (!homes) {
      throw new ApiError(404, "No homes found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        homes,
        "Homes fetched successfully"
      )
    );
  } catch (error) {
    console.log(error);

    return res.status(
      error.statusCode || 500
    ).json(
      new ApiResponse(
        error.statusCode || 500,
        null,
        error.message || "Something went wrong"
      )
    );
  }
};
const searchHomes = async (req, res) => {
  try {
    const { query } = req.query;

    const homes = await Home.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    return res.status(200).json(
      new ApiResponse(200, homes, "Homes fetched successfully")
    );
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, null, error.message)
    );
  }
};

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

 const createOrder = async (req, res) => {
  try {
    const { homeid } = req.params;

    const home = await Home.findById(homeid);

    if (!home) {
      throw new ApiError(404, "Home not found");
    }

    const order = await razorpay.orders.create({
      amount: home.price * 100,
      currency: "INR",
    });

    return res.status(200).json({
      success: true,
      order,
      homeId: home._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


 const verifyPayment = async (req, res) => {
  try {
    const {
      homeId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        razorpay_order_id +
          "|" +
          razorpay_payment_id
      )
      .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      throw new ApiError(
        400,
        "Payment verification failed"
      );
    }

    const home = await Home.findById(homeId);

    if (!home) {
      throw new ApiError(404, "Home not found");
    }

    const alreadyBooked =
      await Booking.findOne({
        guest: req.user._id,
        home: homeId,
      });

    if (alreadyBooked) {
      return res.status(200).json({
        success: true,
        booking: alreadyBooked,
      });
    }

    const booking = await Booking.create({
      guest: req.user._id,
      home: homeId,
      owner: home.owner,
      amount: home.price,
      bookingStatus: "confirmed",
      paymentStatus: "paid",
    });

    return res.status(201).json({
      success: true,
      booking,
      message: "Booking successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export {
  postaddhome,
  getMyBookings,
  getaddhome,
  HostHomeList,
  addFavouriteController,
  Edithome,
  editposthome,
  getMyHomes,
  postdeleathome,
  removeFavouriteController,
  addbookings,
  searchHomes,
  createOrder,
  verifyPayment
};