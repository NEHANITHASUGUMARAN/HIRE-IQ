import asyncHandler from 'express-async-handler';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Initialize the Google OAuth2 Client using the client ID from environment variables
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Generate JWT Token
 * @details Creates a signed JSON Web Token containing the user's ID, which validates future requests.
 * @param   {string} id - The MongoDB ObjectId of the user
 * @returns {string} - The signed JWT string
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token will expire in 24 hours
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    // 1. Destructure the user data sent from the standard registration form
    const { name, email, password, accountRole } = req.body;

    // 2. Validate that all required fields are present
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please enter all required fields (Name, Email, Password).');
    }

    // 3. Database Check: Check if a user with this email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email address.');
    }

    // 4. Create User: Create the document in the database
    // Note: The password will be automatically hashed before saving by the pre('save') hook in models/User.js
    const user = await User.create({ 
        name, 
        email, 
        password,
        accountRole: accountRole === 'recruiter' ? 'recruiter' : 'student' 
    });

    // 5. Respond: If user creation is successful, return the user details along with a new JWT token
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            accountRole: user.accountRole,
            skills: user.skills,
            totalScore: user.totalScore,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data provided. Account creation failed.');
    }
});

/**
 * @desc    Authenticate user & get token (Standard Login)
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    // 1. Destructure login credentials from the request body
    const { email, password } = req.body;

    // 2. Locate the user in the database by their email
    const user = await User.findOne({ email });

    // 3. Authenticate: Check if user exists AND if the provided password matches the hashed password
    if (user && (await user.matchPassword(password))) {
        // Validation success - send back user details and session token
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            accountRole: user.accountRole,
            skills: user.skills,
            token: generateToken(user._id),
        });
    } else {
        // Validation failure - respond with unauthorized status
        res.status(401); 
        throw new Error('Invalid email or password.');
    }
});

/**
 * @desc    Authenticate user via Google OAuth
 * @route   POST /api/users/google
 * @access  Public
 */
const googleLogin = asyncHandler(async (req, res) => {
    // 1. Extract the Google credentials token sent from the frontend GoogleLogin component
    const { token } = req.body; 

    // 2. Cryptographically verify the token with Google to ensure it wasn't forged
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    // 3. Extract the verified user data payload guaranteed by Google
    const payload = ticket.getPayload();
    const { email_verified, name, email, sub: googleId } = payload;

    // Reject the login if Google says the email isn't verified
    if (!email_verified) {
        res.status(401);
        throw new Error('Google email not verified. Login failed.');
    }
    
    // 4. Check if the user already exists in our system
    let user = await User.findOne({ email });

    if (user) {
        // A. Existing user logs in with Google. 
        // If they originally signed up via standard email/password, map their Google ID to their account so both options work.
        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }
    } else {
        // B. Brand new user signing up via Google.
        // We create them without a password. Our User.js model schema makes password optional if googleId is present.
        user = await User.create({ name, email, googleId, password: null });
    }

    // 5. Finalize the login and send the app session token
    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            preferredRole: user.preferredRole,
            accountRole: user.accountRole,
            skills: user.skills,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Could not process user creation or login via Google.');
    }
});

/**
 * @desc    Get user profile data
 * @route   GET /api/users/profile
 * @access  Private (Requires Token)
 */
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user is set by the authMiddleware once it verifies the client's JWT passing in the headers
    if (req.user) {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            preferredRole: req.user.preferredRole,
            accountRole: req.user.accountRole,
            skills: req.user.skills,
            totalScore: req.user.totalScore,
            token: generateToken(req.user._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @desc    Update user profile data
 * @route   PUT /api/users/profile
 * @access  Private (Requires Token)
 */
const updateUserProfile = asyncHandler(async(req, res)=>{
    if(req.user){
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Apply profile text value updates if they were provided in the request
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.preferredRole = req.body.preferredRole || user.preferredRole;
        if (req.body.skills !== undefined) {
            user.skills = req.body.skills;
        }
        
        // Only update password if a new one is provided (which will be hashed automatically by the hook)
        if(req.body.password){
            user.password = req.body.password;
        }

        // Save modifications to the Database
        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            preferredRole: updatedUser.preferredRole,
            accountRole: updatedUser.accountRole,
            skills: updatedUser.skills,
            totalScore: updatedUser.totalScore,
            token: generateToken(updatedUser._id), // Cycle token on data updates just to be safe
        });
    } else {
        res.status(404);
        throw new Error("Target user identification failed.");
    }
});

export { registerUser, loginUser, googleLogin, getUserProfile, updateUserProfile };
