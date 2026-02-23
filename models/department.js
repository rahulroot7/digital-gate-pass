'use strict';
module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    name: DataTypes.STRING,
    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('0', '1', '2'),
      defaultValue: '0',
    }
  }, {
    timestamps: true,
    tableName: 'departments',
  });

  Department.associate = function(models) {
    Department.belongsTo(models.Organization, { foreignKey: 'organization_id',  as: 'organization', });
    Department.hasMany(models.Designation, { foreignKey: 'department_id', as: 'designation' });
  };

  return Department;
};
