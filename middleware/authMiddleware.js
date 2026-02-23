const jwt = require('jsonwebtoken');
const { User, RefreshToken, Role } = require('../models');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
require('dotenv').config({ path: './.env.development' });
const JWT_SECRET = process.env.JWT_SECRET || "signin";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_signin';

// Protect middleware to verify token
const protect = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.json(new ApiResponse(401, null, "No token, authorization denied"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: 'role',
        },
      ],
    });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
     if (error.name === 'TokenExpiredError') {
      try {
        const tokenExist = await RefreshToken.findOne({ where: { token } });
        if (!tokenExist) {
          return res.status(401).json(new ApiError(401, null, "Expired token not found in DB"));
        }
        const { refresh_token } = tokenExist;
        try {
          jwt.verify(refresh_token, JWT_REFRESH_SECRET);
        } catch (refreshErr) {
          if (refreshErr.name === 'TokenExpiredError') {
            return res.status(401).json(new ApiError(401, null, "Refresh token also expired. Please login again."));
          }
          return res.status(401).json(new ApiError(401, null, "Invalid refresh token."));
        }
        const user = await User.findByPk(tokenExist.user_id);
        if (!user) {
          return res.status(404).json(new ApiError(404, null, "User not found"));
        }
        const newToken = jwt.sign({ id: user.id, role: user.role_id }, JWT_SECRET, {
          expiresIn: "8h",
        });
        const newRefreshToken = jwt.sign({ id: user.id, role: user.role_id }, JWT_REFRESH_SECRET, {
          expiresIn: "2d",
        });
        await RefreshToken.upsert({
          user_id: user.id,
          token: newToken,
          refresh_token: newRefreshToken,
        });
        const data = {
          token: newToken,
          user,
        };
        return res.status(200).json(new ApiResponse(200, data, "Token refreshed successfully"));
      } catch (refreshError) {
        return res.status(500).json(new ApiError(500, null, "Token refresh failed", refreshError.message));
      }
    }

    // Other JWT errors (invalid token, malformed, etc.)
    return res.status(401).json(new ApiError(401, null, "Invalid token, authorization denied"));
  }
};

// Admin check middleware
const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
            include: [
              {
                model: Role,
                as: "role",
              },
            ],
          });
    if (user?.role?.name?.toLowerCase() !== "user" && user.status === "1") {
      return next();
    } else {
      return res.json(new ApiResponse(403, null, "Access denied, admin role required"));
    }
  } catch (error) {
    res.status(200).send(new ApiError(500, "", "Server error"));
  }
};

const masterAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
            include: [
              {
                model: Role,
                as: "role",
              },
            ],
          });
     if (user?.role?.name?.toLowerCase() === 'admin') {
      return next();
    } else {
      return res.json(new ApiResponse(403, null, "Access denied, Not permission this role"));
    }
  } catch (error) {
    res.status(200).send(new ApiError(500, "", "Server error"));
  }
};

module.exports = { protect, adminAuth, masterAdmin };
