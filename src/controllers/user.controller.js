import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { upload } from "../middlewares/multer.middlewares.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";
const registerUser = asyncHandler( async (req, res) =>{
    // get user details from frontened
    // validation- not empty
    // check if user is already exist: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullname, email, username, password} =req.body
    console.log("email", email);

    // if(fullName ===""){
    //     throw new ApiError(400,"Full Name is required")
    // }

    if([fullname, email, username, password].some((field) => field?.trim() == "")

    ){
        throw new ApiError(400, "All fields are required")
    }
    
    const existedUser = User.findOne({
        $or:[{usernam},{email}]
    })
    // console.log(existedUser)

    if(existedUser){
        throw new ApiError(409, "User already Exist !!")

    }

     const avatarLocalPath = req.files?.avatar[0]?.path
    // console.log(req.files)
    const coverImageLocalPath = req.files?.avatar[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is Required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar is Required")
    }

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wromg while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


})

export {registerUser}