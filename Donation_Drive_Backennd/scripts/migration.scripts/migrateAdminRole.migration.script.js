//this migrtion script file is for the migration/updation of the roles of the existing admins 
//in version 1 role parameter doesnt exist n the collection but for the requirement we are adding them in this version2
//since we are using the same mondob atlas cluster so not everyone have to run this migration script consider that they are already implemented 

import mongoose from "mongoose";
import dotenv from "dotenv";
import dbConnect from "../../config/dataBase.config.js";
import Admin from "../../models/admin.modals.js";

dotenv.config()

const migrateAdminRole = async (req,res) =>{
    try {
        console.log("ROLE MIGRATION OF ADMIN STARTED!!!")
        await dbConnect()

        //update({filter},{update})
        const result = await Admin.updateMany(
            {
                //filter :if role exists === false
                role : {$exists: false}
            },
            {
                //set the role to admin
                $set:{
                    role:"ADMIN"
                }
            }
        )

        console.log("==================================");
        console.log("✅ Migration Completed Successfully");
        console.log("==================================");
        console.log(`Matched Documents : ${result.matchedCount}`);
        console.log(`Modified Documents: ${result.modifiedCount}`);
        console.log("==================================");
    } catch (error) {
        console.error("❌ Migration Failed");
        console.error(error);
    }
    finally{
        await mongoose.connection.close();
        console.log("\n🔒 Database Connection Closed");
    }
}

migrateAdminRole()