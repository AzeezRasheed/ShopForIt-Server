const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const Token = require("../model/tokenModel");
const crypto = require("crypto");
// const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const registerUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    res.status(400);
    throw new Error("please fill in all required fields");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  //   check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  //   If the user does not exists, Create a new user
  const newUser = await User.create({
    firstname,
    lastname,
    email,
    password,
    isAdmin: false,
  });

  //then we generate a token for the user
  const token = generateToken(newUser.id);

  if (newUser) {
    const { _id, firstname, lastname, email, phone, isAdmin } = newUser;
    res.status(201).json({
      _id,
      firstname,
      lastname,
      email,
      phone,
      isAdmin,
      token,
    });
  } else {
    res.status(400);
    throw new Error("something went wrong or invalid user data");
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //we check if the user password is up to 6 characters
  if (password.length < 6) {
    res.status(400);
    throw new Error("password must be at least 6 characters");
  }

  //we check if user exists in the database
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(400);
    throw new Error("user not found, please signup ");
  }

  //we check if the user password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("invalid email or password");
  }

  //we create a token for the user
  const token = generateToken(user._id);

  //if the user is created, we send all the required fields in json
  if (user && passwordIsCorrect) {
    const { _id, firstname, lastname, phone, email, isAdmin } = user;

    res.status(200).json({
      _id,
      firstname,
      lastname,
      phone,
      email,
      isAdmin,
      token,
    });
  } else {
    res.status(400);
    throw new Error("invalid email or password");
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const allUsers = await User.find({});

  res.status(200).json(allUsers);
});

const getUser = asyncHandler(async (req, res) => {
  // we get the user id from req.user
  const { _id } = req.user;
  // we find the user by the id we get in the params
  const user = await User.findById(_id);

  if (user) {
    const { _id, firstName, lastName, email, phone, isAdmin } = user;

    res.status(200).json({
      _id,
      firstName,
      lastName,
      email,
      phone,
      isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});

// Logged in Boolean, we use it to know if a user is logged in or not
const isUserLoggedIn = asyncHandler(async (req, res) => {
  // we check if there is a bearer token from the header
  const authHeader = req.headers.authorization;

  // we check if there is a bearer token from the header or if it starts with Bearer, else we send a 401 status code
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(200).json(false);
  }

  // we get the token from the header and split it
  const token = authHeader.split(" ")[1];

  // we decode the token
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  // we check if the user exists in the database, because if it is verified, the jwt has the user id in it
  const user = await User.findById(decodedToken.id);
  if (user) {
    return res.status(200).json(true);
  } else {
    res.status(200).json(false);
  }
});

//logout user
const logout = asyncHandler((req, res) => {
  // Send HTTP-only cookie
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now(0)), // it expires straight away
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Successfully logged out" });
});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

const updateUser = asyncHandler(async (req, res) => {
  //check if user already exists
  const userExists = await User.findOne(req.user._id);
  if (userExists) {
    const { name, email, photo, phone, bio } = userExists;

    userExists.name = req.body.name || name;
    userExists.email = email;
    userExists.photo = req.body.photo || photo;
    userExists.phone = req.body.phone || phone;
    userExists.bio = req.body.bio || bio;

    const updatedUser = await userExists.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  //check if there is no user
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { oldPassword, password } = req.body;
  //check if there is no old and new password
  if (!oldPassword && !password) {
    res.status(400);
    throw new Error("Please input a new password");
  }

  //compare the old and new password
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("Password successfully changed");
  } else {
    res.status(400);
    throw new Error("Old Password is incorrect");
  }
});

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
  isUserLoggedIn,
  logout,
  loginStatus,
  updateUser,
  changePassword,
};
