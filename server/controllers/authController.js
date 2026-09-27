import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

export const register = async (req, res) => {
    console.log("Register API Hit");

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        // const hashedPassword = await bcrypt.hash(password, 12);

        // const user = await User.create({
        //     name,
        //     email,
        //     password: hashedPassword,
        // });

        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate verification token
        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        // Hash token before saving in DB
        const hashedVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const user = await User.create({
            name,
            email,
            password: hashedPassword,

            emailVerified: false,

            emailVerificationToken: hashedVerificationToken,

            emailVerificationExpires: Date.now() + 10 * 60 * 1000,
        });

        const verificationUrl =
            `http://localhost:3000/verify-email?token=${verificationToken}`;
        console.log("USER CREATED:", user.email);
        console.log("SENDING EMAIL...");

        await sendEmail({
            to: user.email,
            subject: "Verify Your Email",
            html: `
        <h2>Email Verification</h2>

        <p>Hello ${user.name},</p>

        <p>
            Thank you for registering.
            Please verify your email address by clicking the button below.
        </p>

        <a href="${verificationUrl}"
           style="
               display:inline-block;
               padding:10px 20px;
               background:#007bff;
               color:white;
               text-decoration:none;
               border-radius:5px;
           ">
            Verify Email
        </a>

        <p>This verification link will expire in 10 minutes.</p>

        <p>
            If you did not create this account, please ignore this email.
        </p>
    `,
        });

        console.log("VERIFICATION URL:", verificationUrl);

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Login Controller With Token

export const login = async (req, res) => {
    // console.log(req.body);
    try {
        const { email, password } = req.body;

        // console.log(email);
        // console.log(password);
        // validation

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required",
            });
        }
        // Find User
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // Email verification check
        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in",
            });
        }

        // Generate Tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save Refresh Token in DB
        user.refreshToken = refreshToken;
        await user.save();

        // send Refresh Token in Cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // Production me true
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        return res.status(200).json({
            success: true,
            message: "Login Successfull",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
// Refresh Token Nikalna hai browser cookie se 
export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found",
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );
        console.log("decoded:", decoded)

        const user = await User.findById(decoded.id);
        console.log("user:", user)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        const newAccessToken = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: "15m",
            }
        );


        // Refresh token rotation
        const newRefreshToken = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d",
            }
        );

        user.refreshToken = newRefreshToken;
        await user.save();


        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        //Refresh token rotation End

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
        });
    }
};


// Logout Controller
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh Token Not Found",
            });
        }

        const user = await User.findOne({ refreshToken });

        if (!user) {
            return res.status(402).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        // Revoke Refresh Token
        user.refreshToken = null;
        await user.save();

        //Remove Cookies
        res.clearCookie("refreshToken")

        return res.status(200).json({
            success: true,
            message: "Logout Siccessfully",
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}


//   Forget Controller
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user = await User.findOne({ email });

        // Security: user exist karta hai ya nahi reveal nahi karenge
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If the email exists, a reset link has been sent",
            });
        }

        // Generate random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        console.log("RESET TOKEN:", resetToken);

        // Hash token before saving in DB
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Save hashed token + expiry
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Temporary testing
        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            html: `
        <h2>Password Reset</h2>

        <p>You requested to reset your password.</p>

        <p>
            Click the button below to reset your password:
        </p>

        <a href="${resetUrl}">
            Reset Password
        </a>

        <p>This link will expire in 10 minutes.</p>

        <p>
            If you did not request a password reset,
            please ignore this email.
        </p>
    `,
        });

        console.log("RESET URL:", resetUrl);

        console.log("EMAIL_USER:", process.env.EMAIL_USER);
        console.log(
            "EMAIL_PASS:",
            process.env.EMAIL_PASS ? "Present" : "Missing"
        );

        // Temporary testing
        console.log("RESET TOKEN:", resetToken);

        return res.status(200).json({
            success: true,
            message: "If the email exists, a reset link has been sent",
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;





        if (!token || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Token and password are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match",
            });
        }
        // Hash received token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
        console.log("GENERATED HASH:", hashedToken);

        // Find user with valid token and expiry
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {
                $gt: new Date(),
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }

        console.log("TOKEN IN DB:", user.resetPasswordToken);
        console.log("TOKEN EXPIRY:", user.resetPasswordExpires);

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        user.password = hashedPassword;

        // Invalidate reset token
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        // Revoke existing refresh token
        user.refreshToken = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        // Token nahi mila
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required",
            });
        }

        // Raw token ko hash karo
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Hashed token se user find karo
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification token",
            });
        }

        // Token expire check
        if (user.emailVerificationExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Verification token has expired",
            });
        }

        // Already verified
        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified",
            });
        }

        // Email verify
        user.emailVerified = true;

        // Token ko remove karo
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.log("Verify Email Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
