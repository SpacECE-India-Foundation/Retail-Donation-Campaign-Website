// import mongoose from "mongoose";

// const certificate80GSchema = new mongoose.Schema(
//     {
//         donation: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Donation",
//             required: true,
//             unique: true,
//         },

//         panNumber: {
//             type: String,
//             required: true,
//             trim: true,
//             uppercase: true,
//         },

//         donorName: {
//             type: String,
//             required: true,
//             trim: true,
//         },

//         donorEmail: {
//             type: String,
//             required: true,
//             lowercase: true,
//             trim: true,
//         },

//         donationAmount: {
//             type: Number,
//             required: true,
//             min: 1,
//         },

//         donationDate: {
//             type: Date,
//             required: true,
//         },

//         certificateNumber: {
//             type: String,
//             required: true,
//             unique: true,
//             trim: true,
//         },

//         certificateUrl: {
//             type: String,
//             default: "",
//         },

//         publicId: {
//             type: String,
//             default: "",
//         },

//         generatedAt: {
//             type: Date,
//             default: null,
//         },

//         status: {
//             type: String,
//             enum: ["GENERATED", "FAILED"],
//             default: "GENERATED",
//         },

//         generationError: {
//             type: String,
//             default: "",
//             maxlength: 1000,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// const Certificate80G = mongoose.model(
//     "Certificate80G",
//     certificate80GSchema
// );

// export default Certificate80G;
import mongoose from "mongoose";

const certificate80GSchema = new mongoose.Schema(
    {
        donation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Donation",
            required: true,
            unique: true,
        },

        panNumber: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            match: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
        },

        donorName: {
            type: String,
            required: true,
            trim: true,
        },

        donorEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        donationAmount: {
            type: Number,
            required: true,
            min: 1,
        },

        donationDate: {
            type: Date,
            required: true,
        },

        certificateNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        certificateUrl: {
            type: String,
            default: "",
        },

        publicId: {
            type: String,
            default: "",
        },

        generatedAt: {
            type: Date,
            default: null,
        },

        status: {
            type: String,
            enum: ["GENERATED", "FAILED"],
            default: "FAILED",
        },

        generationError: {
            type: String,
            default: "",
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

const Certificate80G = mongoose.model(
    "Certificate80G",
    certificate80GSchema
);

export default Certificate80G;