import express from "express";
import {verifyJWT} from "../middleware/auth.js";
import * as authcontroller from "../controllers/authcontroller.js";

const authrouter = express.Router();

authrouter.get("/getloginuser", verifyJWT, authcontroller.getloggineduser);
authrouter.post("/signupuser", authcontroller.postsignup);
authrouter.post("/loginuser", authcontroller.postlogin);
authrouter.post("/logoutuser", verifyJWT, authcontroller.logoutUser);

export { authrouter };