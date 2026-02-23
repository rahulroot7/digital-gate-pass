'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      role_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      first_name: {
        type: Sequelize.STRING,
      },
      last_name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      bio: {
        type: Sequelize.TEXT('long'),
      },
      profilePic: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true, // could be null until profile complete
      },
      status: {
        type: Sequelize.ENUM('0', '1', '2'),
        defaultValue: '0',
        comment: '0 - inactive, 1 - active, 2 - profile complete',
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Users');
  },
};
