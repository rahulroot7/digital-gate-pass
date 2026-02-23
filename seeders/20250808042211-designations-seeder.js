'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('designations', [
      { department_id: 1, name: 'Manager', status: '1', createdAt: new Date(), updatedAt: new Date() },
      { department_id: 2, name: 'Engineer', status: '1', createdAt: new Date(), updatedAt: new Date() },
      { department_id: 3, name: 'Accountant', status: '1', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('designations', null, {});
  }
};
