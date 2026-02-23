'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        organization_id: 1,
        department_id: 1,
        designation_id: 1,
        visiting_officer_id: 1,
        name: 'User',
        description: 'Regular user role',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organization_id: 1,
        department_id: 2,
        designation_id: 2,
        visiting_officer_id: 2,
        name: 'Officer',
        description: 'Officer role',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organization_id: 2,
        department_id: 3,
        designation_id: 3,
        visiting_officer_id: 1,
        name: 'Admin',
        description: 'Admin role',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organization_id: 1,
        department_id: 1,
        designation_id: 1,
        visiting_officer_id: 2,
        name: 'Approver',
        description: 'Approver role',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
