'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('visiting_officers', [
      { designation_id: 1, name: 'John Doe', status: '1', createdAt: new Date(), updatedAt: new Date() },
      { designation_id: 2, name: 'Jane Smith', status: '1', createdAt: new Date(), updatedAt: new Date() },
      { designation_id: 3, name: 'Root Rahul', status: '1', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('visiting_officers', null, {});
  }
};
