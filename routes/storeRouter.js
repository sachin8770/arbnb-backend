
const upload=require("../middleware/multerUtil");
const express = require('express');
const storeRouter = express.Router();
const storecontroller=require("../controllers/storecontroller");
const { verifyJWT } = require("../middleware/auth");

storeRouter.get("/gethomes",storecontroller.gethomes);
storeRouter.get("/getHosthomes",storecontroller.gethomeshost);
storeRouter.get("/store/bookings",storecontroller.getbookings);
storeRouter.get("/favourites",verifyJWT,storecontroller.getFavouritesController);
storeRouter.get("/reserved",storecontroller.reservd);
storeRouter.get("/home/:homeid",storecontroller.getEditHome);
// storeRouter.post("/:homeid", storecontroller.posteditredirect);
storeRouter.get("/rules/:homeId", storecontroller.getHouseRules);
storeRouter.get("/arbnbhomes",storecontroller.getarbnbhomes);

module.exports = storeRouter;