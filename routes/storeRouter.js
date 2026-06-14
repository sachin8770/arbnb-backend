
import upload from "../middleware/multerUtil.js";
import express from 'express';
const storeRouter = express.Router();
import * as storecontroller from "../controllers/storecontroller.js";
import { verifyJWT } from "../middleware/auth.js";
import { optionalJWT } from "../middleware/optionalauth.js";

storeRouter.get("/gethomes",optionalJWT,storecontroller.gethomes);
storeRouter.get("/getHosthomes",storecontroller.gethomeshost);
storeRouter.get("/store/bookings",storecontroller.getbookings);
storeRouter.get("/favourites",verifyJWT,storecontroller.getFavouritesController);
storeRouter.get("/reserved",storecontroller.reservd);
storeRouter.get("/home/:homeid",storecontroller.getEditHome);
storeRouter.get("/rules/:homeId", storecontroller.getHouseRules);
storeRouter.get("/arbnbhomes",storecontroller.getarbnbhomes);

export default storeRouter;