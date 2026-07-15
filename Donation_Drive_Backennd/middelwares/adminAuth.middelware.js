//THIS MIDDELWARFE WILL ALWAYS RUN WHENEVER THE AUTHORISED OPERATIONS ARE TO BE DONE FROM ADMIN SIDE IT BASICALLY CHECKS EVERYTIME WEATHER THE ADMIN IS AUTHENTICATED OR NOT

import jwt from "jsonwebtoken"
import { ApiError } from "../utils/apiError.utils.js"
import { ApiResponse } from "../utils/apiResponse.utils.js"

export const adminAuth = async (req,res, next)=>{
    try {
        const {accessToken} = req.cookies //requesting for the token from cookies as we have stored them in the browser cookies

        ApiError.assert(accessToken,"unAuthorized Login Again!!")

        const tokenDecode = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET_KEY
        )

        req.admin = {
            adminId : tokenDecode.adminId
        }

        next()

    } catch (error) {
        console.error(error);

    return res.status(error.statusCode || 500).json(
        new ApiError(
            error.statusCode || 500,
            error.message
        )
    );
    }
}