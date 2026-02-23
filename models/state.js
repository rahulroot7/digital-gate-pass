'use strict';
module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define('State', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: DataTypes.STRING,
    country_id: DataTypes.INTEGER
  }, {
    tableName: 'states',
    timestamps: true,
    paranoid: true
  });

  State.associate = function(models) {
    State.belongsTo(models.Country, {
      foreignKey: 'country_id',
      as: 'country'
    });

    State.hasMany(models.City, {
      foreignKey: 'state_id',
      as: 'cities'
    });
  };

  return State;
};
