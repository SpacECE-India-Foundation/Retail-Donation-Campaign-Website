import jwt from "jsonwebtoken"

//HERE, WE WILL IMPLEMENT THE UTILITY FUNCTION TO GENERATE ACCESS AND REFRESH TOKEN


//GENERATING THE ACCESS TOKEN WHICH ARE SHORT LIVED WE WILL BY DEFAULT SET IT TO 5DAYS BECAUSE IF SOMEONE GOT THE TOKEN IT WILL AUTOMATICALLY EXPIRE AFTER 5 DAYS

export const generateAccessToken = (tokenObject) =>{
    return jwt.sign(
        tokenObject,
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn:"5d"
        }
    )
}

//GENERATING THE REFRESH TOKEN BY WHICH WE WILL GENERATE THE ACCESS TOKEN WHEN IT WILL EXPIRE
export const generateRefreshToken = (refreshTokenObj) =>{
    return jwt.sign(
        refreshTokenObj,
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
            expiresIn:"14d"
        }
    )
}
