const controller = {}
const { Appointment } = require('../../models');
const { Op } = require('sequelize');
const ApiError = require('../../utils/ApiError')
const ApiResponse = require('../../utils/ApiResponse')
const { query, validationResult } = require('express-validator');
const { Sequelize } = require('sequelize');
const moment = require('moment');

controller.dashboard = async (req, res) => {
  try {
    const range = req.query.range || 'months';
    const value = parseInt(req.query.value) || (range === 'hours' ? 24 : range === 'days' ? 7 : 12);
    const [total, approved, pending, rejected] = await Promise.all([
      Appointment.count(),
      Appointment.count({ where: { status: '2' } }).catch(() => 0),
      Appointment.count({ where: { status: '1' } }).catch(() => 0),
      Appointment.count({ where: { status: '3' } }).catch(() => 0),
    ]);
    const summary = [
      { key: 'totalAppointment', value: total || 0 },
      { key: 'approved', value: approved || 0 },
      { key: 'pending', value: pending || 0 },
      { key: 'rejected', value: rejected || 0 },
    ];
    let trend = [];
    if (range === 'months') {
      const stats = await Appointment.findAll({
        attributes: [
          [Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "createdAt"')), 'month'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        ],
        group: ['month'],
        raw: true,
      });
      trend = Array.from({ length: value }, (_, i) => {
        const monthIndex = moment().subtract(value - 1 - i, 'months').month(); // 0-11
        const found = stats.find(s => parseInt(s.month) === monthIndex + 1);
        return {
          label: moment().month(monthIndex).format('MMM'),
          count: found ? parseInt(found.count) : 0,
        };
      });
    } else if (range === 'days') {
      const fromDate = moment().subtract(value - 1, 'days').startOf('day').toDate();
      const stats = await Appointment.findAll({
        attributes: [
          [Sequelize.fn('DATE_TRUNC', 'day', Sequelize.col('createdAt')), 'day'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        ],
        where: { createdAt: { [Op.gte]: fromDate } },
        group: ['day'],
        order: [['day', 'ASC']],
        raw: true,
      });
      trend = Array.from({ length: value }, (_, i) => {
        const day = moment().subtract(value - 1 - i, 'days').startOf('day');
        const found = stats.find(s => moment(s.day).isSame(day, 'day'));
        return {
          label: day.format('DD MMM'),
          count: found ? parseInt(found.count) : 0,
        };
      });

    } else if (range === 'hours') {
      const fromDate = moment().subtract(value - 1, 'hours').toDate();
      const stats = await Appointment.findAll({
        attributes: [
          [Sequelize.fn('EXTRACT', Sequelize.literal('HOUR FROM "createdAt"')), 'hour'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        ],
        where: { createdAt: { [Op.gte]: fromDate } },
        group: ['hour'],
        order: [['hour', 'ASC']],
        raw: true,
      });
      trend = Array.from({ length: value }, (_, i) => {
        const hour = (moment().subtract(value - 1 - i, 'hours')).hour();
        const found = stats.find(s => parseInt(s.hour) === hour);
        return {
          label: `${hour}:00`,
          count: found ? parseInt(found.count) : 0,
        };
      });
    }
    return res.status(200).json(
      new ApiResponse(200, {
        summary,
        trend,
        range,
        value
      }, "Dashboard data fetched successfully.")
    );

  } catch (error) {
    return res.status(500).json(new ApiError(500, null, "Error fetching dashboard data", error.message));
  }
};

module.exports = controller