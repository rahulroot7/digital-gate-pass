'use strict';

module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    reference_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    visiting_officer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    meeting_purpose: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('0', '1', '2', '3'),
      defaultValue: '0',
      comment: '0 - Inactive, 1 - Pending, 2 - Approved 3 - Reject',
    },
    qr_code_path: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'appointments',
    timestamps: true,
  });

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    Appointment.belongsTo(models.VisitingOfficer, {
      foreignKey: 'visiting_officer_id',
      as: 'visitingOfficer',
    });
    Appointment.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });

    Appointment.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });

    Appointment.belongsTo(models.Designation, {
      foreignKey: 'designation_id',
      as: 'designation',
    });
  };

  return Appointment;
};
