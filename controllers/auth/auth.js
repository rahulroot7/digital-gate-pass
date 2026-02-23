const controller = {}
const { User, Otp, RefreshToken, Role } = require('../../models');
const jwt = require("jsonwebtoken");
const { Op, where } = require('sequelize');
const ApiError = require('../../utils/ApiError')
const ApiResponse = require('../../utils/ApiResponse')
const { query, validationResult } = require('express-validator');
const bcrypt = require("bcrypt");
require('dotenv').config({path:'./.env.development'})
const JWT_TOKEN = process.env.JWT_SECRET || 'signin';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_signin';
const sendOtp = require('../../services/sendOtp')

controller.requestOtp = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
        }
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ error: "Phone number is required" });
        }
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
        const sendResult = await sendOtp(phone, otpCode);

        if (!sendResult.success) {
            res.status(500).json(new ApiError(500, "Failed to send OTP", sendResult.message));
        }
        const existingOtp = await Otp.findOne({ where: { phone, type: 'register' } });

        if (existingOtp) {
            await existingOtp.update({
                otp: otpCode,
                expires_at: expiresAt,
            });
        } else {
            await Otp.create({
                phone,
                otp: otpCode,
                type: 'register',
                expires_at: expiresAt,
            });
        }
        return res.status(200).json(new ApiResponse(200, otpCode, "OTP sent successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Internal server error", error.message));
    }
};

controller.otpVerify = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { phone, otp, fcm_id } = req.body;
        const validOtp = await Otp.findOne({ where: { phone, otp, type: 'register' } });
        if (!validOtp || validOtp.expires_at < new Date()) {
            return res.status(500).json(new ApiError(400, null, "Invalid or expired OTP"));
        }
        let user = await User.findOne({ where: { phone } });
        if (!user) {
            const role = await Role.findOne({
                where: {
                name: { [Op.iLike]: 'user' }
                }
            });
            user = await User.create({
                phone,
                role_id: role?.id || null,
                status: '1',
                fcm_id: fcm_id || null,
            });
        } else if (fcm_id && (user.fcm_id !== fcm_id || user.fcm_id == null)) {
            await user.update({ fcm_id });
        }
        const token = jwt.sign({ id: user.id, role: user.role_id }, JWT_TOKEN, {
            expiresIn: "8h",
        });
        const refreshToken = jwt.sign({ id: user.id, role: user.role_id }, JWT_REFRESH_SECRET, {
            expiresIn: "2d",
        });
        await RefreshToken.upsert({
            user_id: user.id,
            token: token,
            refresh_token: refreshToken,
        });
        const userData = await User.findOne({ where: { phone },
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'name']
                }
            ]
        });
        const data = {
            token: token,
            user: userData,
        };
        await Otp.destroy({ where: { id: validOtp.id } });
        return res.status(200).json(new ApiResponse(200, data, "OTP verified successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, null, "OTP verification failed", error.message));
    }
};

module.exports = controller