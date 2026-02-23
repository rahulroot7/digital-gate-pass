'use strict';
module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define('City', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: DataTypes.STRING,
    state_id: DataTypes.INTEGER,
    pincode: DataTypes.INTEGER
  }, {
    tableName: 'cities',
    timestamps: true,
    paranoid: true
  });

  City.associate = function(models) {
    City.belongsTo(models.State, {
      foreignKey: 'state_id',
      as: 'state'
    });
  };

  return City;
};
