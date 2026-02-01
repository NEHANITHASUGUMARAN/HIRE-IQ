
import asyncHandler from 'express-async-handler';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d', 
    });
};


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please enter all required fields (Name, Email, Password).');
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email address.');
    }

    const user = await User.create({ name, email, password });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data provided.');
    }
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            token: generateToken(user._id),
        });
    } else {
        res.status(401); 
        throw new Error('Invalid email or password.');
    }
});


const googleLogin = asyncHandler(async (req, res) => {
  
    const { token } = req.body; 

   
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    

    const payload = ticket.getPayload();
    const { email_verified, name, email, sub: googleId } = payload;

    if (!email_verified) {
        res.status(401);
        throw new Error('Google email not verified. Login failed.');
    }
    
    
    let user = await User.findOne({ email });

    if (user) {
        
        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }
    } else {
        
        user = await User.create({ name, email, googleId, password: null });
    }

    
    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Could not process user creation or login via Google.');
    }
});


const getUserProfile = asyncHandler(async (req, res) => {
   
    if (req.user) {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            preferredRole: req.user.preferredRole,
            token: generateToken(req.user._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateUserProfile=asyncHandler(async(req,res)=>{
  if(req.user){
    const user=await User.findById(req.user._id);
    user.name=req.body.name || user.name;
    user.email=req.body.email || user.email;
    user.preferredRole=req.body.preferredRole || user.preferredRole;
    if(req.body.password){
        user.password=req.body.password;
    }
    await user.save();
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        preferredRole: user.preferredRole,
        token: generateToken(user._id),
    })
  }
  else{
    res.status(404);
    throw new Error("User not found");
  }
})

export { registerUser, loginUser, googleLogin,getUserProfile,updateUserProfile };
