'use strict';
module.exports = (sequelize, DataTypes) => {
  const VisitingOfficer = sequelize.define('VisitingOfficer', {
    name: DataTypes.STRING,
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('0', '1', '2'),
      defaultValue: '0',
    }
  }, {
    timestamps: true,
    tableName: 'visiting_officers',
  });

  VisitingOfficer.associate = function(models) {
    VisitingOfficer.belongsTo(models.Designation, { foreignKey: 'designation_id', as: 'designation' });
  };

  return VisitingOfficer;
};
