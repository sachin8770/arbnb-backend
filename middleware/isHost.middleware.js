import {User}  from "../models/user.js";
import  {ApiError}  from "../utils/ApiError.js";
export const isHost = async (req,res,next)=>{
     const userid = req.user._id;

const user = await User.findById(userid).select("role");


  if(user.role!=="host"){
    throw new ApiError(400, "only Host can perform action");
  }
      next();
 
};