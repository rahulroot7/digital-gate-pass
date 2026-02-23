const controller = {}
const {  User, Role, UserAadharDetail, ConsentLog, Page } = require("../../models");
const { Op } = require('sequelize');
const ApiError = require('../../utils/ApiError')
const ApiResponse = require('../../utils/ApiResponse')
const { query, validationResult } = require('express-validator');
const sendFcmNotification = require('../../services/sendFcmNotification');

controller.userDashboard = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const profile = await  User.findOne({ where: { status: '1', id: currentUserId },
            include: [
                { model: UserAadharDetail, as: 'aadharDetail' },
                { model: Role, as: 'role', attributes: ['id','name'] }
            ],attributes: ['email','fcm_id']
        }); 
        res.json(new ApiResponse(200, profile, "Dashboard fetched successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Internal Server Error", [error.message]));
    }
}

controller.profileUpdate = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const userId = req.user.id;
        const { email } = req.body;
        const existingUser = await User.findByPk(userId);
        if (!existingUser) {
            return res.status(404).json(new ApiResponse(404, null, "User not found"));
        }
        const updateData = await existingUser.update({email, role_id: '1'});
        return res.status(200).json(new ApiResponse(200, updateData, "Profile updated successfully"));

    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
   }
};

controller.consentLog = async (req, res) => {
    const { page_id, ip_address } = req.body;
    if (!page_id) {
        return res.status(400).json({ message: 'user_id and page_id are required' });
    }
    try {
        const consent = await ConsentLog.create({
        user_id: req.user?.id,
        page_id,
        version: 'v1',
        ip_address: ip_address || req.ip,
        });
        return res.status(200).json(new ApiResponse(200, consent, "Consent logged successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
    }
};

controller.getUserConsents = async (req, res) => {
    try {
        const logs = await ConsentLog.findAll({
        include: [
            { model: User, as: 'user', attributes: ['id', 'phone', 'email'] },
            { model: Page, as: 'page', attributes: ['id', 'title','content'] }
        ],
        order: [['accepted_at', 'DESC']]
        });
            return res.status(200).json(new ApiResponse(200, logs, "Consent logged successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
    }
};

controller.sendFcmToUsers = async (req, res) => {
  try {
    const { user_ids, title, message, data } = req.body;
    if (!user_ids || !title || !message) {
      return res.status(400).json(new ApiError(400, null, "Missing user_ids, title or message"));
    }
    const userIdArray = Array.isArray(user_ids) ? user_ids : [user_ids];
    const users = await User.findAll({
      where: { id: userIdArray, status: '1' },
      attributes: ['id', 'fcm_id'],
    });
    const fcmTokens = users.map(u => u.fcm_id).filter(Boolean);
    if (fcmTokens.length === 0) {
      return res.status(404).json(new ApiError(404, null, "No FCM tokens found for selected users"));
    }
    const fcmResponse = await sendFcmNotification(fcmTokens, title, message, data || {});
    return res.status(200).json(
      new ApiResponse(200, { successCount: fcmResponse.successCount }, "Notifications sent")
    );
  } catch (error) {
    console.error("FCM Notification Error:", error);
    return res.status(500).json(
      new ApiError(500, null, "Failed to send FCM notification", error.message)
    );
  }
};

module.exports = controller