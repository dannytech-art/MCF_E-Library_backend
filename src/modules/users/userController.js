const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const userModel = require('../users/userModel');
const { generateVerificationCode } = require("../../middleware/otpMiddleware");
const { sendMail } = require('../../middleware/brevoMiddleware');
const { signUpTemp } = require('../../utils/emailTemplates');

const allowedFaculties = [
    'Faculty Of Art',
    'Faculty Of Science',
    'Faculty Of Engineering',
    'Faculty Of Social Sciences',
    'Faculty Of Education'
];

const sanitizeUser = (user) => {
    const data = user.toObject ? user.toObject() : { ...user };
    delete data.password;
    delete data.otp;
    delete data.otpExpiery;
    return data;
};

const createToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

const isOwnAccount = (req, id) => {
    return req.user && req.user._id.toString() === String(id);
};

exports.Signup = async (req, res) => {
    try {
        const { otp, expiresAt } = generateVerificationCode();
        const { fullName, email, password, faculty } = req.body;

        if (!fullName || !email || !password || !faculty) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!allowedFaculties.includes(faculty)) {
            return res.status(400).json({
                message: "Invalid faculty",
                allowedFaculties
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await userModel.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            fullName,
            email: normalizedEmail,
            password: hashedPassword,
            faculty
        });

        newUser.otp = otp;
        newUser.otpExpiery = expiresAt;

        await newUser.save();

        await sendMail(
            newUser.email,
            "Email Verification",
            signUpTemp(newUser.otp, newUser.fullName)
        );

        const token = createToken(newUser);

        return res.status(201).json({
            message: "User registered successfully",
            verify_account: `Enter the OTP sent to ${newUser.email} for Email verification`,
            data: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                faculty: newUser.faculty,
                token
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.VerifyOtp = async (req, res) => {
    try {
        const { otp, email } = req.body;

        if (!otp || !email) {
            return res.status(400).json({
                message: 'Otp and email are required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await userModel.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: 'Email already verified'
            });
        }

        if (String(user.otp) !== String(otp)) {
            return res.status(400).json({
                message: 'Invalid otp'
            });
        }

        if (Date.now() > user.otpExpiery) {
            return res.status(400).json({
                message: 'Otp expired request for a new otp'
            });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiery = null;

        await user.save();

        return res.status(200).json({
            message: "Email verified successfully",
            token: createToken(user),
            data: sanitizeUser(user),
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.ResendOtp = async (req, res) => {
    try {
        const { otp, expiresAt } = generateVerificationCode();
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await userModel.findOne({
            email: normalizedEmail
        });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: 'Email already verified'
            });
        }

        user.otp = otp;
        user.otpExpiery = expiresAt;

        await user.save();

        await sendMail(
            user.email,
            "Email Verification",
            signUpTemp(user.otp, user.fullName)
        );

        res.status(200).json({
            message: "Otp sent successfuly",
            verify_account: `Enter the OTP sent to ${user.email} for Email verification`,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password required.' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ message: 'user not found, please signup' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: " either password or email is incorrect" });
        }

        res.status(200).json({
            message: "user logged in successfuly",
            token: createToken(user),
            data: sanitizeUser(user)
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.GetProfile = async (req, res) => {
    try {
        return res.status(200).json({
            message: "profile fetched successfully",
            data: sanitizeUser(req.user)
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.GetAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('-password -otp -otpExpiery');
        res.status(200).json({
            message: "users retrived successfuly",
            data: users
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.GetUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id).select('-password -otp -otpExpiery');
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            });
        }
        res.status(200).json({
            message: "user fetched successfuly",
            data: user
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.UpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, faculty } = req.body;

        if (!isOwnAccount(req, id)) {
            return res.status(403).json({
                message: "You can only update your own profile"
            });
        }

        if (faculty && !allowedFaculties.includes(faculty)) {
            return res.status(400).json({
                message: "Invalid faculty",
                allowedFaculties
            });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            });
        }

        if (fullName) user.fullName = fullName;
        if (faculty) user.faculty = faculty;

        await user.save();

        res.status(200).json({
            message: "user updated successfully",
            data: sanitizeUser(user)
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.ChangePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "currentPassword and newPassword are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "newPassword must be at least 6 characters"
            });
        }

        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({
            message: "password updated successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

exports.DeleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isOwnAccount(req, id)) {
            return res.status(403).json({
                message: "You can only delete your own account"
            });
        }

        const user = await userModel.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            });
        }

        res.status(200).json({
            message: "user deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
