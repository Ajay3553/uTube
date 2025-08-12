import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js'

const registerUser = asyncHandler(async (req, res) => {
  const {fullName, email, username, password} = req.body // get user Data from frontend
  if([fullName, email, username, password].some((field) => field?.trim() == "")){ //Validation
    throw new apiError(400, "All Fields are Required")
  }
  const existedUser = await User.findOne({ //validation
    $or : [{ username }, { email }]
  })

  if(existedUser) throw new apiError(409, "User with Email or Username already exist") //validation
  
  const avaterLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if(!avaterLocalPath) throw new apiError(400, "Avater file is Required") //validation : since Avatar is a required field
  
  const avatar = await uploadOnCloudinary(avaterLocalPath); // upload to cloudinary
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

export { registerUser };
