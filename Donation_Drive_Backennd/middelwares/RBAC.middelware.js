import { ApiError } from "../utils/apiError.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";

//just impose this middelware wth the authorize(SUPER_ADMIN) wherever we want to access role based access

export const authorize = (...allowedRoles) =>{
    return (req,res,next) =>{
        if(!allowedRoles.includes(req.admin.role)){
            return next(
                new ApiError(
                    403,
                    "You are not authorized to perform this action."
                )
            );
        }

        next();
    }
}