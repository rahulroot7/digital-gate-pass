'use strict';

module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define('Page', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    banner_image: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '1',
      comment: '0 - Inactive, 1 - Active',
    },
  }, {
    paranoid: true,
    tableName: 'pages',
    timestamps: true,
  });

  return Page;
};
