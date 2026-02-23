'use strict';
module.exports = (sequelize, DataTypes) => {
  const Designation = sequelize.define('Designation', {
    name: DataTypes.STRING,
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('0', '1', '2'),
      defaultValue: '0',
    }
  }, {
    timestamps: true,
    tableName: 'designations',
  });

  Designation.associate = function(models) {
    Designation.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department', });
    Designation.hasMany(models.VisitingOfficer, { foreignKey: 'designation_id', id: 'visitingOfficer' });
  };

  return Designation;
};
