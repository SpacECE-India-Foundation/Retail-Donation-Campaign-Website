//THIS CONFIGURATION IS FOR CENTRAL DATABASE CONNECTIVITY OVER THE ENTIRE BACKEND AND SERVER 

import mongoose from "mongoose"
import colors from "colors"


const dbConnect = async () =>{
    const mongoDbUri = process.env.MONGODB_URI
    try {
        const conn = await mongoose.connect(mongoDbUri)
        console.log(colors.green("Database Connected Successfully!!"))
        if(conn.connection.readyState===1){
            return true
        }
        return false
    } catch (error) {
        console.log("DATABASE CONNECTION FAILED!!")
        console.log(error)
    }
}

export default dbConnect