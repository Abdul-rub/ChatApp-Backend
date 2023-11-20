const asyncHandler = require("express-async-handler")
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const bcrypt = require('bcrypt');


//Get Users
const allUsers = asyncHandler(async(req,res)=>{
  const keyword = req.query.search ? {
    $or: [
      {name: {$regex : req.query.search, $options:"i"}},
      {email: {$regex : req.query.search, $options:"i"}},

    ],
  }: {}

  const users = await User.find(keyword).find({_id:{$ne: req.user._id}})
  res.send(users)
 
})

//Register
const registerUser = asyncHandler(async(req,res)=>{
    const {name,email,password,pic} = req.body;

    if(!name || !email || !password ){
        res.send(400);
    throw new Error("Please ENter all the fields")
    }
  

    const userExist = await User.findOne({email});
    if(userExist){
        res.send(400);
    throw new Error("User already exists")
    }


    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
  
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      pic,
    });

    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    }else{
        res.send(400);
        throw new Error("Failed to create user")

    }




})


//Login
const loginUser = asyncHandler(async(req,res)=>{
   const {email,password} = req.body;

   const user = await User.findOne({ email });


   if (user) {
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid Email or Password');
    }
  } else {
    res.status(401);
    throw new Error('Invalid Email or Password');
  }
})

module.exports = {registerUser, loginUser,allUsers}