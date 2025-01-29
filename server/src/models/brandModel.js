"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
const { mongoose } = require("../configs/dbConnection");

/* -------------------------------------------------------
   SAMPLE BODY SHAPE:
   {
     "name": "Brand 1",
     "description": "Some new description",
     "image": "http://imageURL"
   }
------------------------------------------------------- */

// Brand Model:
const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      // URL
      type: String,
      trim: true,
      default: "",
    },
  },
  { collection: "brands", timestamps: true }
);

/* ------------------------------------------------------- */
module.exports = mongoose.model("Brand", BrandSchema);
