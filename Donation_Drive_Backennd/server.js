import express from "express"
import "dotenv/config"
import cors from "cors"
import colors from "colors"
import cookieParser from "cookie-parser"
import dbConnect from "./config/dataBase.config.js"
import { ApiError } from "./utils/apiError.utils.js"
import { ApiResponse } from "./utils/apiResponse.utils.js"
import { registerAdmin } from "./controllers/authControllers/admin.auth.controller.js"
import { upload } from "./utils/upload.utils.js"
import adminAuthRoutes from "./routes/Admin.auth.routes.js"
import getAdminRoute from "./routes/AdminOperationRoutes/getAdmin.js"
import campaignAdminOperationsRoutes from "./routes/AdminOperationRoutes/campaign.adminOperation.routes.js"
import milestoneAdminOperationRoute from "./routes/AdminOperationRoutes/milestone.adminOperrations.routes.js"
import donationAdminOperationsRoutes from "./routes/AdminOperationRoutes/donation.adminOperation.routes.js"
import donationPublicRoutes from "./routes/publicOperationRoutes/donations.routes.js"
import publicCampaignRoutes from "./routes/publicOperationRoutes/campaigns.routes.js"

//HERE WE WILL FIRST GET THE PORT FROM OUR ENV ON WHICH LOCALHOST PORT WE WILL RUN ON OUR SERVER
const port = process.env.PORT
//just for debugging, remove later
console.log("Server port:", port)

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
        //just for debugging, remove later
        console.log("Database connection failed, server not started")
    }
}

//---------------------------------------------------ROUTING IMPLEMENTATION-----------------------------------------
app.use('/api/admin/auth',adminAuthRoutes)
app.use('/api/admin',getAdminRoute)
app.use('/api/admin/campaign',campaignAdminOperationsRoutes)
app.use('/api/admin/milestone',milestoneAdminOperationRoute)
app.use('/api/donations', donationAdminOperationsRoutes)
app.use('/api/public/donation',donationPublicRoutes)
app.use('/api/campaigns', publicCampaignRoutes)

//----------------------------------------------------ROUTE NOT FOUNF 404 ------------------------------------------
// route not found handler
app.use((req, res) => {
  res.status(404).json(new ApiResponse(404, null, "Route not found"))
})

//------------------------------------------------------GLOBAL ERROR HANDLER----------------------------------------------
// global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err)

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      new ApiResponse(err.statusCode, null, err.message, err.errors)
    )
  }

  if (err.name === "ValidationError") {
    const validationErrors = Object.values(err.errors).map((error) => error.message)
    return res.status(400).json(
      new ApiResponse(400, null, "Validation failed", validationErrors)
    )
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue)[0]
    return res.status(409).json(
      new ApiResponse(409, null, `${duplicateField} already exists`, err.keyValue)
    )
  }

  res.status(err.statusCode || 500).json(
    new ApiResponse(err.statusCode || 500, null, err.message || "Internal Server Error")
  )
})

//---------------------------------------------------LETS START THE SERVER NOW-----------------------------------------
startServer()