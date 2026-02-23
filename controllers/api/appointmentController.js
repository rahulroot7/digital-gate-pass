const controller = {}
const { Appointment, User, Organization, Department, Designation, VisitingOfficer, UserAadharDetail } = require('../../models');
const { Op } = require('sequelize');
const ApiError = require('../../utils/ApiError')
const ApiResponse = require('../../utils/ApiResponse')
const { query, validationResult } = require('express-validator');
const regexFilter = require('../../utils/filterRejex');
const sendFcmNotification = require('../../services/sendFcmNotification');
const FcmMessages = require('../../constants/fcmMessages');
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
require('dotenv').config({path:'./.env.development'})

const generateReferenceId = async (userId, AppointmentModel) => {
  const count = await AppointmentModel.count({where: { user_id: userId }});
  const nextCount = count + 1;
  const padded = String(nextCount).padStart(3, '0');
  return `APT-${padded}${userId}`;
};

controller.appointment = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { date, time, organization_id, department_id, designation_id, visiting_officer_id, meeting_purpose } = req.body;
        const userId = req.user.id;
        const reference_id = await generateReferenceId(userId, Appointment);
        const appointment = await Appointment.create({
            reference_id,
            user_id: userId,
            date,
            time,
            organization_id,
            department_id,
            designation_id,
            visiting_officer_id,
            meeting_purpose,
            status: '1'
        });
        const fullAppointment = await Appointment.findOne({
        where: { id: appointment.id },
        include: [
            { model: User, as: 'user', attributes: ['id', 'email'], include: [{ model: UserAadharDetail, as: 'aadharDetail' }] },
            { model: Organization, as: 'organization', attributes: ['id', 'name'] },
            { model: Department, as: 'department', attributes: ['id', 'name'] },
            { model: Designation, as: 'designation', attributes: ['id', 'name'] },
            { model: VisitingOfficer, as: 'visitingOfficer', attributes: ['id', 'name'] }
        ]
        });
        if(fullAppointment){
            return res.status(200).json(new ApiResponse(200, fullAppointment, "Appointment scheduled successfully"));
        }
    } catch (error) {
        res.status(500).json(new ApiError(500, "Internal Server Error", [error.message]));
    }
};

controller.appointmentList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from_date, to_date } = req.query;
    const where = { user_id: userId };
    if (from_date && to_date) where.date = { [Op.between]: [new Date(from_date), new Date(to_date)] };
    else if (from_date) where.date = { [Op.gte]: new Date(from_date) };
    else if (to_date) where.date = { [Op.lte]: new Date(to_date) };
    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email'], include: [{ model: UserAadharDetail, as: 'aadharDetail' }] },
        { model: Organization, as: 'organization', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'name'] },
        { model: VisitingOfficer, as: 'visitingOfficer', attributes: ['id', 'name'] },
      ],
    });

    res.status(200).json(new ApiResponse(200, appointments, "Appointment list fetched successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal Server Error", [error.message]));
  }
};

controller.viewAppointment = async (req, res) => {
    try{
        const { id } = req.params;

        const appointment = await Appointment.findOne({
            where: { id, user_id: req.user?.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'email'], include: [{ model: UserAadharDetail, as: 'aadharDetail' }] },
                { model: Organization, as: 'organization', attributes: ['id', 'name'] },
                { model: Department, as: 'department', attributes: ['id', 'name'] },
                { model: Designation, as: 'designation', attributes: ['id', 'name'] },
                { model: VisitingOfficer, as: 'visitingOfficer', attributes: ['id', 'name'] },
            ],
        });
        if (!appointment) {
            return res.status(404).json(new ApiResponse(404, null, "Appointment not found"));
        }
        res.status(200).json(new ApiResponse(200, appointment, "Appointment view successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Internal Server Error", [error.message]));
    }
};

controller.updateStatus = async (req, res) => {
    try {
        const { appointment_id, status } = req.body;
        if (!appointment_id || status === undefined) {
            return res.status(400).json(new ApiError(400, "appointment and status are required"));
        }
        const appointment = await Appointment.findByPk(appointment_id, {
                include: [
                    {
                        model: User, as: 'user',
                        attributes: ['id', 'email', 'fcm_id'],
                    },
                ],
                });
        if (!appointment) {
            return res.status(404).json(new ApiError(404, "Appointment not found"));
        }
        appointment.status = status;
        await appointment.save();
        const userFcmId = appointment.user?.fcm_id;
        if (status === "2" || status === 2) {
            const qrUrl = `${process.env.BASE_API_URL}/appointment/qr-scan/${appointment.reference_id}`;
            const fileName = `qr-${appointment.reference_id}.png`;
            const outputPath = path.join(__dirname, "../../uploads/qr_code", fileName);
            await QRCode.toFile(outputPath, qrUrl);
            const { title, message } = FcmMessages.APPOINTMENT_APPROVED;
            const data = {
                "screen": "notifications",
                "priority": "high"
            };
            await sendFcmNotification([userFcmId], title, message, data || {});
            appointment.qr_code_path = `/uploads/qr_code/${fileName}`;
            await appointment.save();
        }
        // For Rejected
        if (status === "3" || status === 3) {
            const { title, message } = FcmMessages.APPOINTMENT_REJECTED;
            const data = {
                "screen": "notifications",
                "priority": "high"
            };
            await sendFcmNotification([userFcmId], title, message, data || {});
            appointment.qr_code_path = null;
            await appointment.save();
        }
        return res.status(200).json(new ApiResponse(200, appointment, "Appointment status updated successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Internal Server Error", [error.message]));
    }
};

controller.qrScaneAppointment = async (req, res) => {
    try{
        const { reference_id } = req.params;
        const appointment = await Appointment.findOne({
            where: { reference_id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'email'], include: [{ model: UserAadharDetail, as: 'aadharDetail' }] },
                { model: Organization, as: 'organization', attributes: ['id', 'name'] },
                { model: Department, as: 'department', attributes: ['id', 'name'] },
                { model: Designation, as: 'designation', attributes: ['id', 'name'] },
                { model: VisitingOfficer, as: 'visitingOfficer', attributes: ['id', 'name'] },
            ],
        });
        if (!appointment) {
            return res.status(404).json(new ApiResponse(404, null, "Appointment not found"));
        }
        res.status(200).json(new ApiResponse(200, appointment, "Appointment view successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Internal Server Error", [error.message]));
    }
};

controller.searchAppointments = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;
        const filter = req.query.filter ? regexFilter(req.query.filter) : '';
        const searchConditions = filter
            ? [
                { '$department.name$': { [Op.iLike]: `%${filter}%` } },
                { reference_id: { [Op.iLike]: `%${filter}%` } },
                { '$visitingOfficer.name$': { [Op.iLike]: `%${filter}%` } },
                ]
            : [];
        const query = {
        where: {
            user_id: req.user.id
        },
        limit: limit,
        offset: offset,
        distinct: true,
        order: [["createdAt", "DESC"]],
       include: [
                { model: User, as: 'user', attributes: ['id', 'email'], include: [{ model: UserAadharDetail, as: 'aadharDetail' }] },
                { model: Organization, as: 'organization', attributes: ['id', 'name'] },
                { model: Department, as: 'department', attributes: ['id', 'name'] },
                { model: Designation, as: 'designation', attributes: ['id', 'name'] },
                { model: VisitingOfficer, as: 'visitingOfficer', attributes: ['id', 'name'] },
            ],
        };
        if (filter) {
            query.where[Op.or] = searchConditions
        }
        const appointments = await Appointment.findAll(query);
        return res.status(200).json(new ApiResponse(200, appointments, "Filtered appointments fetched successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal Server Error", [error.message]));
    }
};

module.exports = controller