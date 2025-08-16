import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js'


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
  const user = await User.findOne({$or : [{username, email}]});
  if(!user) throw new apiError(404, "User does not Exist");
  
  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid) throw new apiError(401, "Invalid User Credentials");

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  }

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

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie('accessToken', options)
  .clearCookie('refreshToken', options)
  .json(new apiResponse(200, {}, "User Logged Out"))
})

export { registerUser, loginUser, logoutUser };
