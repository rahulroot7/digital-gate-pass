'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
     role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'roles',
        key: 'id',
      },
      allowNull: true
    },
    fcm_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    bio: {
        type: DataTypes.TEXT('long'),
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('0', '1', '2'),
      defaultValue: '0',
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    paranoid: true,
    tableName: 'users',
    timestamps: true,
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role'
    });

    User.hasOne(models.UserAadharDetail, {
      foreignKey: 'user_id',
      as: 'aadharDetail'
    });
    
  };

  return User;
};
