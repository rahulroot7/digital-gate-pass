const controller = {}
const { User, RefreshToken, Role } = require('../../models');
const jwt = require("jsonwebtoken");
const { Op, fn, col, where } = require('sequelize');
const ApiError = require('../../utils/ApiError')
const ApiResponse = require('../../utils/ApiResponse')
const { query, validationResult } = require('express-validator');
const bcrypt = require("bcrypt");
require('dotenv').config({path:'./.env.development'})
const JWT_TOKEN = process.env.JWT_SECRET || 'signin';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_signin';
const sendEmail = require("../../services/sendEmail");
const ejs = require("ejs");
const path = require("path");
const crypto = require("crypto");

controller.login = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json(new ApiError(401, null, "User not found"));
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json(new ApiError(401, null, "Invalid email or password"));
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
        const userData = await User.findOne({
            where: { id: user.id },
            include: [
                {
                    model: Role,
                    as: "role",
                    attributes: ["id", "name"],
                },
            ],
        });
        const data = { token, user: userData };
        return res.status(200).json(new ApiResponse(200, data, "Login successful"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, null, "Login failed", error.message));
    }
};

controller.adminForgotPassword = async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    const { email } = req.body;
    const user = await User.findOne({ where: { email }, include: [
                {
                    model: Role,
                    as: "role",
                    attributes: ["id", "name"],
                },
            ], 
        });
    if (!user || user?.role?.name?.toLowerCase() !== "admin") {
      return res.status(404).json(new ApiResponse(404, null, "Invalid Email !"));
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.BASE_URL}/${resetToken}`;
    const templatePath = path.join(__dirname, "../../templates", "resetPasswordEmail.ejs");
    const html = await ejs.renderFile(templatePath, { resetUrl });
    const text = `Reset your password: ${resetUrl}`;

    await sendEmail({
      to: user.email,
      subject: "Admin Password Reset",
      text,
      html,
    });
    return res.status(200).json(new ApiResponse(200, null, "Reset password email sent. Please check."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, null, "Error sending reset email", error.message));
  }
};;

// Admin Reset Password
controller.adminResetPassword = async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    const { token, password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { [Op.gt]: Date.now() },
            },
            include: [
                {
                model: Role,
                as: "role",
                attributes: ["id","name"],
                },
            ],});
    if (!user || user?.role?.name?.toLowerCase() !== "admin") {
      return res.status(400).json(new ApiError(400, null, "Invalid or expired token"));
    }
    user.password = await bcrypt.hash(password, 10);;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json(new ApiError(500, "Reset password failed", error.message));
  }
};

controller.createAdmin = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, bio, role_id } = req.body;
    const profilePic = req.file ? req.file.filename : null;
    const image_path = `/uploads/profiles/${profilePic}`;
    const role = await Role.findByPk(role_id);
    if (!role) {
      return res.status(400).json(new ApiError(400, null, "Invalid role_id"));
    }
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          email ? { email } : null,
          { phone }
        ].filter(Boolean)
      }
    });
    if (existingUser) {
      return res.status(409).json(new ApiError(409, null, "Email or phone already exists"));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      role_id,
      first_name,
      last_name,
      email: email || null,
      phone,
      bio: bio || null,
      profilePic: image_path || null,
      password: hashedPassword,
      status: "1",
      email_verified: !!email
    });
    return res.status(201).json(new ApiResponse(201, newUser, "User with role created successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    let { first_name, last_name, email, phone, password, bio, role_id, status } = req.body;
    const profilePic = req.file ? req.file.filename : null;
    const image_path = `/uploads/profiles/${profilePic}`;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }
    const role = await Role.findByPk(role_id);
    if (!role) {
      return res.status(400).json(new ApiError(400, null, "Invalid role_id"));
    }
    const existingUser = await User.findOne({
      where: {
        [Op.and]: [
          { id: { [Op.ne]: id } },
          {
            [Op.or]: [
              email ? { email } : null,
              phone ? { phone } : null
            ].filter(Boolean)
          }
        ]
      }
    });
    if (existingUser) {
      return res.status(409).json(new ApiError(409, null, "Email or phone already exists"));
    }
    if (password) {
      password = await bcrypt.hash(password, 10);
    } else {
      password = user.password;
    }
    await user.update({
      role_id,
      first_name,
      last_name,
      email: email || null,
      phone,
      bio: bio || null,
      profilePic: image_path || null,
      password,
      status: status || user.status,
      email_verified: !!email
    });
    return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.adminList = async (req, res) => {
  try {
    const { phone, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let filter = {};
    if (phone) {
      filter[Op.or] = [
        where(fn("LOWER", col("phone")), {
          [Op.like]: `%${phone.toLowerCase()}%`
        })
      ];
    }
    const { count, rows: users } = await User.findAndCountAll({
      where: filter,
      offset,
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
      include: [{ model: Role, as: "role" }]
    });
    if (!users) return res.status(404).json(new ApiResponse(404, null, "User not found"));
    return res.status(200).json(
      new ApiResponse(200, users, "User fetched successfully", count, parseInt(limit))
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.viewAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [{ model: Role, as: "role" }]
    });
    if (!user) return res.status(404).json(new ApiResponse(404, null, "User not found"));
    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json(new ApiResponse(404, null, "User not found"));
    await user.destroy();
    return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

module.exports = controller