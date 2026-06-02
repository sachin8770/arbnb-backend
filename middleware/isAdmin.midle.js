import  {ApiError}  from "../utils/ApiError.js";
import {User}  from "../models/user.js";
export const isAdmin= async (req,res,next)=>{
     const userid = req.user._id;
const user = await User.findById(userid).select("role");


  if(user.role!=="admin"){
    throw new ApiError(400, "only Admin can perform action");
  }
      next();
 
};