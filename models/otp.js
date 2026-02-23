'use strict';
module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define('Otp', {
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aadharNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('login', 'resend', 'register','aadhar'),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },{
      tableName: 'otps',
      timestamps: true,
  });

  return Otp;
};
