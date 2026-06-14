import {verifyJWT} from "../middleware/auth.js";
import path from "path";
import express from "express";
import multer from "multer";

import upload from "../middleware/multerUtil.js";
import * as homecontroller from "../controllers/hostcontroller.js";
import { isHost } from "../middleware/isHost.middleware.js";

const hostRouter = express.Router();

hostRouter.get("/getaddhome",verifyJWT, homecontroller.getaddhome);
hostRouter.get("/homes/:homeId", homecontroller.getHomeByIdController);
hostRouter.post("/add-home", upload.single("photo"), verifyJWT,isHost, homecontroller.postaddhome);
hostRouter.get("/home-list", homecontroller.HostHomeList);
hostRouter.get("/search",homecontroller.searchHomes
);
hostRouter.post("/add-favourite/:homeId",verifyJWT, homecontroller.addFavouriteController);
hostRouter.post("/remove-favourite/:homeId",verifyJWT, homecontroller.removeFavouriteController);
hostRouter.get("/edit-home/:homeid", homecontroller.Edithome);
hostRouter.post("/edit-home", homecontroller.editposthome);
hostRouter.post("/delete/:homeid", homecontroller.postdeleathome);
hostRouter.get(
  "/my-homes",
  verifyJWT,
  homecontroller.getMyHomes
);
hostRouter.get(
  "/my-bookings",
  verifyJWT,
  homecontroller.getMyBookings
);
hostRouter.post(
  "/bookings/:homeid",
  verifyJWT,
  homecontroller.addbookings
);
hostRouter.post(
  "/create-order/:homeid",
  verifyJWT,
  homecontroller.createOrder
);

hostRouter.post(
  "/verify-payment",
  verifyJWT,
  homecontroller.verifyPayment
);
export { hostRouter };