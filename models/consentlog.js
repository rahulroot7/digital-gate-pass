'use strict';

module.exports = (sequelize, DataTypes) => {
  const ConsentLog = sequelize.define('ConsentLog', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    page_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    accepted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'consent_logs',
    timestamps: true,
  });

  ConsentLog.associate = (models) => {
    ConsentLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    ConsentLog.belongsTo(models.Page, {
      foreignKey: 'page_id',
      as: 'page',
    });
  };

  return ConsentLog;
};
