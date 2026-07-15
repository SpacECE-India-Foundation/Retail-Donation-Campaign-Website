//THIS CONTROLLER IS TO GET THE CURRENT ADMIN I.E. THE ADMIN LOGGED IN WILL GET THEIR OWN INFO

import { ApiError } from "../../utils/apiError.utils.js";
import Admin from "../../models/admin.modals.js";
import { ApiResponse } from "../../utils/apiResponse.utils.js";


export const getCurrentAdmin = async (req,res) =>{
    try {
        const {adminId} = req.admin;
        const admin = await Admin.findById(adminId).select("-password")
        return res.status(200).json(
            new ApiResponse(
                200,
            {
                admin
            },
                "Admin Fetched!!"
             )
         );
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