'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserAadharDetail = sequelize.define('UserAadharDetail', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    state_id: {
      type: DataTypes.INTEGER,
    },
    city_id: {
      type: DataTypes.INTEGER,
    },
    mode: {
      type: DataTypes.ENUM('online', 'offline'),
    },
    aadhar_number: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
    dob: {
      type: DataTypes.STRING,
    },
    mobile_number: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    aadhaar_zip: {
      type: DataTypes.STRING,
    },
    share_code: {
      type: DataTypes.STRING,
    },
    image_path: {
      type: DataTypes.STRING,
    },
    pin_code: {
      type: DataTypes.STRING,
    },
    type_of_id: {
      type: DataTypes.STRING,
    },
    id_image: {
      type: DataTypes.STRING,
    }
  }, {
    tableName: 'user_aadhar_details',
    timestamps: true,
    paranoid: true,
  });

  UserAadharDetail.associate = (models) => {
    UserAadharDetail.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    UserAadharDetail.belongsTo(models.State, { foreignKey: 'state_id', as: 'state' });
    UserAadharDetail.belongsTo(models.City, { foreignKey: 'city_id', as: 'city' });
  };

  return UserAadharDetail;
};
