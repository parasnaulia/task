const mongoose = require("mongoose");
const validator = require("validator");
const schema1 = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is Not Valid");
        // console.log("Ekfm");
      }
    },
  },
  Phone: {
    type: Number,
    required: true,
    // min: [10, "Enter Valid Phone"],
  },
  DateOfBirth: {
    type: Date,
    // required: true,
  },
  Password: {
    type: String,
    required: true,
    select: false,
  },
  CPassword: {
    type: String,
    required: true,
    select: false,
  },
  cartItems: [
    {
      id: {
        type: Number,
      },
      title: {
        type: String,
      },
      price: {
        type: Number,
      },
      description: {
        type: String,
      },
      catagory: {
        type: String,
      },
      image: {
        type: String,
      },
      rating: {
        rate: {
          type: Number,
        },
        count: {
          type: Number,
        },
      },
      Quant: {
        type: Number,
      },
    },
  ],
});
const Ecommerce = mongoose.model("Ecommerce", schema1);
module.exports = Ecommerce;
