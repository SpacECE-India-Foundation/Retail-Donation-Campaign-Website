//we are shifting from version1 to version2 and here we wnats to implement super admin functionality 
//only superAdmin can add futher sub admins 
//but how initially we will add the superAdmin, so thats why we are using the concept of seeding 
//here, we will create a seeding script and run that script which will create super Admin
//in this we will be using attributes to store in the .env

import Admin from "../../models/admin.modals.js";
import dotenv from "dotenv"
import dbConnect from "../../config/dataBase.config.js";
import bcrypt, { hash } from "bcryptjs";
import mongoose from "mongoose";
import { ApiError } from "../../utils/apiError.utils.js";
dotenv.config()

const registerSuperAdminScript = async () =>{
    try {
        console.log("Starting Super Admin Seeding.....")

        //lets connect the db
        await dbConnect()

        //now we will find weather any super admin exist or not
        const isSuperAdminExists = await Admin.exists({
            $or:[
                { role: "SUPER_ADMIN" },
                { email: process.env.SUPER_ADMIN_EMAIL }
            ]
        })

        if(isSuperAdminExists){
            console.log("SUPER ADMIN ALREADY EXISTS! COULD NOT CREATE ANOTHER....")
            return
        }

        //now we will get the values from the .env variables for the super admin credentials
        if(!process.env.SUPER_ADMIN_FULLNAME || !process.env.SUPER_ADMIN_EMAIL || !process.env.SUPER_ADMIN_PASSWORD || !process.env.SUPER_ADMIN_PHONE){
             throw new Error(
                "Missing SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in .env"
            );
        }

        //now we will hash the password and save it 
        const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD,12)

        //now we create and save this into the db collection
        const newSuperAdmin = await Admin.create({
            fullName:process.env.SUPER_ADMIN_FULLNAME,
            email:process.env.SUPER_ADMIN_EMAIL,
            phone:process.env.SUPER_ADMIN_PHONE,
            password:hashedPassword,
            role:"SUPER_ADMIN",
            isVerified:true
        })

        console.log("======================================");
        console.log("Super Admin Created Successfully");
        console.log("======================================");
        console.log(`Name : ${newSuperAdmin.fullName}`);
        console.log(`Email: ${newSuperAdmin.email}`);
        console.log("Role : SUPER_ADMIN");
        console.log("======================================");



    } catch (error) {
        console.log("failed to create super Admin")
        console.log(error.message)
    }finally{
        await mongoose.connection.close()
        console.log("\n Database Connection Closed");
    }
}

registerSuperAdminScript()