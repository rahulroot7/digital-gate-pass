const controller = {}
const { Op, where } = require('sequelize');
const ApiError = require('../../utils/ApiError')
const ApiResponse = require('../../utils/ApiResponse')
const { query, validationResult } = require('express-validator');
const { State, City } = require('../../models');

controller.getStates = async (req, res) => {
  try {
    const states = await State.findAll({
        where: {
            country_id: 101,
        },
        attributes: ['id', 'name'],
        });
    if (!states) {
      return res.status(404).json(new ApiResponse(404, null, "States not found"));
    }
    return res.status(200).json(new ApiResponse(200, states, "States fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.getCities = async (req, res) => {
  try {
    const stateId = req.params.state_id;
    const cities = await City.findAll({
      where: {
        state_id: stateId,
      },
      attributes: ['id', 'name'],
    });
    if (!cities || cities.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, "Cities not found"));
    }
    return res.status(200).json(new ApiResponse(200, cities, "Cities fetched successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
    }
};


module.exports = controller