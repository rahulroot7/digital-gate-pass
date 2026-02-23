'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('departments', [
      { organization_id: 1, name: 'HR', status: '1', createdAt: new Date(), updatedAt: new Date() },
      { organization_id: 1, name: 'IT', status: '1', createdAt: new Date(), updatedAt: new Date() },
      { organization_id: 2, name: 'Finance', status: '1', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departments', null, {});
  }
};
