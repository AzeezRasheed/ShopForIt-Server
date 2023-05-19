const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Firstame must be provided"],
    },
    lastname: {
      type: String,
      required: [true, "Lastname must be provided"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Email address is required"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [6, "Password must be up to 6 characters long"],
    },
    phone: {
      type: String,
      default: "+234",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

Schema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(this.password, salt);
  this.password = hashPassword;
  next();
});

const User = mongoose.model("User", Schema);
module.exports = User;
