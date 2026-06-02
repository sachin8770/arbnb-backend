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
hostRouter.post("/add-favourite/:homeId",verifyJWT, homecontroller.addFavouriteController);
hostRouter.post("/remove-favourite/:homeId",verifyJWT, homecontroller.removeFavouriteController);
hostRouter.get("/edit-home/:homeid", homecontroller.Edithome);
hostRouter.post("/edit-home", homecontroller.editposthome);
hostRouter.post("/delete/:homeid", homecontroller.postdeleathome);

hostRouter.post("/bookings/:homeid", homecontroller.addbookings);
hostRouter.get("/bookings/:homeid", homecontroller.addbookings);

export { hostRouter };