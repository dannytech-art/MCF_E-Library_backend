const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const {
    Signup,
    VerifyOtp,
    Login,
    GetAllUsers,
    GetUserById,
    ResendOtp,
    GetProfile,
    UpdateUser,
    ChangePassword,
    DeleteUser
} = require('./userController');

/**
 * @swagger
 * /signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates an account, hashes the password, sends a 4-digit OTP (15 minutes), and returns a JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User registered. OTP sent to email.
 *       400:
 *         description: Missing fields, invalid faculty, or user already exists.
 *       500:
 *         description: Server or email error.
 */
router.post('/signup', Signup);

/**
 * @swagger
 * /verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email with OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: Email verified. Returns JWT and user.
 *       400:
 *         description: Invalid, expired, or already verified.
 *       404:
 *         description: User not found.
 */
router.post('/verify-otp', VerifyOtp);

/**
 * @swagger
 * /resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Resend email verification OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOtpRequest'
 *     responses:
 *       200:
 *         description: New OTP sent.
 *       400:
 *         description: Email missing or already verified.
 *       404:
 *         description: User not found.
 */
router.post('/resend-otp', ResendOtp);

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful. Returns JWT and user (no password).
 *       400:
 *         description: Missing fields or incorrect credentials.
 *       404:
 *         description: User not found.
 */
router.post('/login', Login);

/**
 * @swagger
 * /profile:
 *   get:
 *     tags: [Users]
 *     summary: Get the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile.
 *       401:
 *         description: Missing or invalid token.
 */
router.get('/profile', authenticate, GetProfile);

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of users (password and OTP omitted).
 *       401:
 *         description: Missing or invalid token.
 */
router.get('/users', authenticate, GetAllUsers);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found.
 *       401:
 *         description: Missing or invalid token.
 *       404:
 *         description: User not found.
 *   put:
 *     tags: [Users]
 *     summary: Update own profile
 *     description: Authenticated users may update only their own fullName and faculty. Password is changed via /change-password.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated.
 *       400:
 *         description: Invalid faculty.
 *       401:
 *         description: Missing or invalid token.
 *       403:
 *         description: Attempted to update another user.
 *       404:
 *         description: User not found.
 *   delete:
 *     tags: [Users]
 *     summary: Delete own account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted.
 *       401:
 *         description: Missing or invalid token.
 *       403:
 *         description: Attempted to delete another user.
 *       404:
 *         description: User not found.
 */
router.get('/user/:id', authenticate, GetUserById);
router.put('/user/:id', authenticate, UpdateUser);
router.delete('/user/:id', authenticate, DeleteUser);

/**
 * @swagger
 * /change-password:
 *   put:
 *     tags: [Users]
 *     summary: Change the authenticated user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated.
 *       400:
 *         description: Missing fields, weak password, or wrong current password.
 *       401:
 *         description: Missing or invalid token.
 */
router.put('/change-password', authenticate, ChangePassword);

module.exports = router;
