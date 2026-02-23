const controller = {}
const { Appointment, User, Organization, Department, Designation, VisitingOfficer, UserAadharDetail } = require('../../models');
const { Op } = require('sequelize');
const ApiError = require('../../utils/ApiError')
const ApiResponse = require('../../utils/ApiResponse')
const { query, validationResult } = require('express-validator');

controller.appointmentList = async (req, res) => {
  try {
    const { page = 1, limit = 10, from_date, to_date, status = 'all' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (from_date && to_date) {
      where.date = { [Op.between]: [new Date(from_date), new Date(to_date)] };
    } else if (from_date) {
      where.date = { [Op.gte]: new Date(from_date) };
    } else if (to_date) {
      where.date = { [Op.lte]: new Date(to_date) };
    }
    const statusMap = {
      pending: '1',
      approved: '2',
      reject: '3',
      inactive: '0'
    };
    if (status.toLowerCase() !== 'all') {
      const enumValue = statusMap[status.toLowerCase()];
      if (enumValue !== undefined) {
        where.status = enumValue;
      } else {
        return res.status(400).json(new ApiError(400, "Invalid status filter"));
      }
    }
    if (req.user.role.name.toLowerCase() === 'user') {
      return res.json(new ApiResponse(403, null, "Access denied, admin role required"));
    }
    if (req.user.role.name.toLowerCase() !== 'admin') {
      where.organization_id = req.user.role.organization_id;
      where.department_id = req.user.role.department_id;
      where.designation_id = req.user.role.designation_id;
      where.visiting_officer_id = req.user.role.visiting_officer_id;
    }
    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'email'], include: [{ model: UserAadharDetail, as: 'aadharDetail' }] },
        { model: Organization, as: 'organization', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'name'] },
        { model: VisitingOfficer, as: 'visitingOfficer', attributes: ['id', 'name'] },
      ],
    });

    res.status(200).json(new ApiResponse(200, appointments, "Appointment list fetched successfully", count, parseInt(limit)));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal Server Error", [error.message]));
  }
};

controller.viewAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { id };
    const roleName = req.user.role.name?.toLowerCase();
    if (roleName === 'user') {
      return res.status(403).json(new ApiResponse(403, null, "Access denied, admin role required"));
    }
    if (roleName !== 'admin') {
      where.organization_id = req.user.role.organization_id;
      where.department_id = req.user.role.department_id;
      where.designation_id = req.user.role.designation_id;
      where.visiting_officer_id = req.user.role.visiting_officer_id;
    }
    const appointment = await Appointment.findOne({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email'], include: [{ model: UserAadharDetail, as: 'aadharDetail' }] },
        { model: Organization, as: 'organization', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'name'] },
        { model: VisitingOfficer, as: 'visitingOfficer', attributes: ['id', 'name'] },
      ],
    });
    if (!appointment) {
      return res.status(404).json(new ApiError(404, null, "Appointment not found or access denied"));
    }
    return res.status(200).json(new ApiResponse(200, appointment, "Appointment details fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error", [error.message]));
  }
};

module.exports = controller