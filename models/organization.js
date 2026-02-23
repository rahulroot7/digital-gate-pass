'use strict';
module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('Organization', {
    name: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('0', '1', '2'),
      defaultValue: '0',
    }
  }, {
    timestamps: true,
    tableName: 'organizations',
  });

  Organization.associate = function(models) {
    Organization.hasMany(models.Department, { foreignKey: 'organization_id', as: 'departments', });
  };

  return Organization;
};
