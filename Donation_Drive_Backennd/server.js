import express from "express"
import "dotenv/config"
import cors from "cors"
import colors from "colors"
import cookieParser from "cookie-parser"
import dbConnect from "./config/dataBase.config.js"

//HERE WE WILL FIRST GET THE PORT FROM OUR ENV ON WHICH LOCALHOST PORT WE WILL RUN ON OUR SERVER
const port = process.env.PORT
console.log(port)

//LETS INITIALISE AN EXPRESS APP
const app = express()



//-----------------------------------CORS OPERATIONS, ALLOWED ORIGINS----------------------------------------------

//NOW THIS SECTION WILL HAVE THE CORS RELATED POLICIES, WE WILL CREATE AN ARRAY OF ALLOWED ORIGINS, IF SOMEONE WNATS TO ADD OTHER ORIGINS OF FRONTEND REQUEST THEY CAN ADD THE ADDRESS IN THIS ARRAY
const allowedOrigins = [
    "http://localhost:5173" //currently localhost is set in allowed origins as we are working on localhost
]

const corsOptions = {
    origin : function(origin,callback){
        if(!origin || allowedOrigins.includes(origin)){ //here, this condition means that if the origin is not defined or null or if the origin is from the allowed origins then we will allow it 
            //here, !origin is for the postman testing as it doenst send request with the browser headers
            //callback(error, allow)
            callback(null,true)
        }else{
            callback(new Error("Not Allowed by CORS!!"))
        }
    },
    credentials: true //this is for sending cookies and tokens on cross origins
}


//--------------------------------------------------INITIALISING THE REQUIRED MIDDELWARES--------------------------------------------------------------------
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())


//---------------------------------------------------INITIAL SERVER RUNNING ENDPOINT--------------------------------------------------------------
//lets make the running endpoint
app.get('/',(req,res)=>res.send(
    "Retail Donation Drive Server!!"
))


//-------------------------------------------------------DATABASE CONNECTION ESTABLISHMENT----------------------------------------------
//lets establish the connection with the database and if the connection is established then only listen the server
const startServer = async () =>{
    const dataBaseConnected = await dbConnect()
    if(dataBaseConnected){
        app.listen(port,()=>console.log(colors.green(`Server is listening on port ${port}`)))
    }else{
        console.log(colors.blue(`Halting Operations!!!`)); 
    }
}

//---------------------------------------------------LETS START THE SERVER NOW-----------------------------------------
startServer()