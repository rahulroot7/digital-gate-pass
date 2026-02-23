'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('countries', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      iso: {
        type: Sequelize.CHAR(2),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false
      },
      nicename: {
        type: Sequelize.STRING(80),
        allowNull: false
      },
      iso3: {
        type: Sequelize.CHAR(3)
      },
      numcode: {
        type: Sequelize.SMALLINT
      },
      phonecode: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('countries');
  }
};
