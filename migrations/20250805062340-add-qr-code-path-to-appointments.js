'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('appointments', 'qr_code_path', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'status',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('appointments', 'qr_code_path');
  }
};
