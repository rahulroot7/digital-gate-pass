'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('organizations', [
      { name: 'Org A', status: '1', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Org B', status: '1', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('organizations', null, {});
  }
};
