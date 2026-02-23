'use strict';
module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define('Country', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    iso: DataTypes.CHAR(2),
    name: DataTypes.STRING,
    nicename: DataTypes.STRING,
    iso3: DataTypes.CHAR(3),
    numcode: DataTypes.SMALLINT,
    phonecode: DataTypes.INTEGER
  }, {
    tableName: 'countries',
    timestamps: true,
    paranoid: true
  });

  Country.associate = function(models) {
    Country.hasMany(models.State, {
      foreignKey: 'country_id',
      as: 'states'
    });
  };

  return Country;
};
