import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
import {v2 as cloudinary} from 'cloudinary';
import jwt from 'jsonwebtoken';

const options = {
    httpOnly: true,
    secure: true
  }

const deleteFromCloudinary = asyncHandler(async (publicId) => {
  try{
    await cloudinary.uploader.destroy(publicId);
  }
  catch(e){
    throw new apiError(500, "Something went wrong while deleteing old image", e.message)
  }
})

const generateAccessAndRefreshTokens = async(userId) => {
  try{
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken};
  }
  catch(e){
    throw new apiError(500, "Something went wrong while generating refresh and access token");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const {fullName, email, username, password} = req.body // get user Data from frontend
  if([fullName, email, username, password].some((field) => field?.trim() == "")){ //Validation
    throw new apiError(400, "All Fields are Required")
  }
  const existedUser = await User.findOne({ //validation
    $or : [{ username }, { email }]
  })

  if(existedUser) throw new apiError(409, "User with Email or Username already exist") //validation
  
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if(!avatarLocalPath) throw new apiError(400, "Avater file is Required") //validation : since Avatar is a required field
  
  const avatar = await uploadOnCloudinary(avatarLocalPath); // upload to cloudinary
  if(!avatar) throw apiError(400, "Avatar file is Required") // validation
  const coverImage = await uploadOnCloudinary(coverImageLocalPath); // upload to cloudinary

  const user = await User.create({  // create user object - create entry in DB
    fullName,
    avatar : avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select( //remove password and refreshToken field from response
    "-password -refreshToken" // user will not send the password and refreshToken since it should be private and other data will be send to DB
  );

  if(!createdUser) throw new apiError(500, "Something Went Wrong While Registering the User") //validation

  return res.status(201).json(
    new apiResponse(200, createdUser, "User Registered Successfully")
  )
});

const loginUser = asyncHandler (async (req, res) => {
  const {email, username, password} = req.body;
  if(!(username || email)) throw new apiError(400, "username or email is required");
  const credentials = [];
  
  if(username) credentials.push({username});
  if(email) credentials.push({email});
  
  const user = await User.findOne({$or: credentials});;
  if(!user) throw new apiError(404, "User does not Exist");
  
  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid) throw new apiError(401, "Invalid User Credentials");

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new apiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User Logged In Successfully"
    )
  )
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  return res
  .status(200)
  .clearCookie('accessToken', options)
  .clearCookie('refreshToken', options)
  .json(new apiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler( async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if(!incomingRefreshToken){
    throw new apiError(401, "unauthorized request")
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id);
  
    if(!user){
      throw new apiError(401, "Invalid refresh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new apiError(401, "Refresh Token expired")
    }
  
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new apiResponse(
        200,
        {accessToken, refreshToken: newRefreshToken},
        "Access token refreshed"
      )
    )
  } catch (e) {
    throw new apiError(401, e?.message || "Invalid Refresh Token")  
  }
})

const changeCurrentPassword = asyncHandler( async(req, res) => {
  const {oldPassword, newPassword, confirmPassword} = req.body();

  if(newPassword !== confirmPassword){
    throw new apiError(400, "New Password and Confirm Password must be same")
  }

  const user = await User.findById(req.user?._id);
  const isCorrectPassword = await user.isPasswordCorrect(oldPassword);
  if(!isCorrectPassword){
    throw new apiError(400, "Wrong Password");
  }

  user.password = newPassword;
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new apiResponse(200, {}, "Password Change Successfully"))
})

const getCurrectUser = asyncHandler( async(req, res) => {
  return res
  .status(200)
  .json(new apiResponse(200, req.user, "fetched Current User Successfully"))
})

const updateAccountDetails = asyncHandler( async(req, res) => {
  const {fullName, email} = req.body();
  if(!fullName || !email){
    throw new apiError(400, "All fields are required")
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName: fullName,
        email: email
      }
    },
    {
      new: true
    }
  ).select("-password")

  return res
  .status(200)
  .json(
    new apiResponse(200, updatedUser, "Account Details Updated Successfully")
  )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if(!avatarLocalPath){
    throw new apiError(400, "Avatar file is required")
  }

  const userOld = await User.findById(req.user?._id);
  if(userOld?.avatar){
    const oldAvaterId = userOld.avatar.split('/').pop().split('.')[0];
    await deleteFromCloudinary(oldAvaterId);
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if(!avatar.url){
    throw new apiError(400, "Error occured while uploading avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar : avatar.url
      }
    },
    {
      new: true
    }
  ).select("-password")

  return res
  .status(200)
  .json(
    new apiResponse(
      200,
      user,
      "Avatar updated successfully"
    )
  )
})

const upadateUserCoverImage = asyncHandler( async (req, res) => {
  const coverImageLocalPath = req.file?.path
  if(!coverImageLocalPath){
    throw new apiError(400, "Cover Image not found")
  }

  const userOld = await User.findById(req.user?._id);

  if(userOld?.coverImage){
    const oldCoverImageId = userOld.coverImage.split('/').pop().split('.')[0];
    await deleteFromCloudinary(oldCoverImageId)
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if(!coverImage.url){
    throw new apiError(400, "Error occured while uploading cover image")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage : coverImage
      }
    },
    {
      new: true
    }
  ).select("-password")

  return res
  .status(200)
  .json(
    new apiResponse(
      200,
      user,
      "Cover image updated successfully"
    )
  )
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrectUser,updateAccountDetails, updateUserAvatar, upadateUserCoverImage };
