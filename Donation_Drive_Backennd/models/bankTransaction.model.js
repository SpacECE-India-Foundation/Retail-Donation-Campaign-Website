// import mongoose, { Schema } from "mongoose";

// const bankTransactionSchema = new Schema(
//     {
//         transactionId: {
//             type: String,
//             required: true,
//             trim: true,
//             index: true,
//             unique: true,
//         },

//         amount: {
//             type: Number,
//             required: true,
//             min: 0,
//         },

//         transactionDate: {
//             type: Date,
//             required: true,
//         },

//         senderName: {
//             type: String,
//             trim: true,
//             default: "",
//         },

//         remarks: {
//             type: String,
//             trim: true,
//             default: "",
//         },

//         uploadedBy: {
//             type: Schema.Types.ObjectId,
//             ref: "Admin",
//             required: true,
//         },

//         statementFileName: {
//             type: String,
//             required: true,
//             trim: true,
//         },

//         isMatched: {
//             type: Boolean,
//             default: false,
//         },

//         matchedDonation: {
//             type: Schema.Types.ObjectId,
//             ref: "Donation",
//             default: null,
//         },

//         matchedAt: {
//             type: Date,
//             default: null,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );


// const BankTransaction = mongoose.model( "BankTransaction",bankTransactionSchema);
// export default BankTransaction;

import mongoose, { Schema } from "mongoose";

const bankTransactionSchema = new Schema(
  {
    statement: {
      type: Schema.Types.ObjectId,
      ref: "BankStatement",
      required: true,
      index: true,
    },

    utr: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    senderName: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },

    isMatched: {
      type: Boolean,
      default: false,
      index: true,
    },

    matchedDonation: {
      type: Schema.Types.ObjectId,
      ref: "Donation",
      default: null,
      index: true,
    },

    processingStatus:{

    type:String,

    enum:[

        "PENDING",

        "PROCESSING",

        "MATCHED",

        "FAILED"

    ],

    default:"PENDING"

},

    failureReason:{

    type:String,

    enum:[

        "DONATION_NOT_FOUND",

        "AMOUNT_MISMATCH",

        "CAMPAIGN_NOT_FOUND",

        "DUPLICATE_TRANSACTION",

        "UNKNOWN_ERROR"

    ],

    default:null

},

    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    matchedAt: {
      type: Date,
      default: null,
    },
    lastRetryAt:{

    type:Date,

    default:null

}
  },
  {
    timestamps: true,
  }
);

/**
 * Compound indexes
 */

bankTransactionSchema.index({
  utr: 1,
  amount: 1,
});

bankTransactionSchema.index({
  statement: 1,
  processingStatus: 1,
});

bankTransactionSchema.index({
  isMatched: 1,
  matchedDonation: 1,
});

const BankTransaction = mongoose.model(
  "BankTransaction",
  bankTransactionSchema
);

export default BankTransaction;