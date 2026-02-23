'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin role ID
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'Admin' LIMIT 1;`
    );

    const adminRoleId = roles[0]?.id;

    if (!adminRoleId) {
      throw new Error('Admin role not found. Run the roles seeder first.');
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        role_id: adminRoleId,
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@gmail.com',
        phone: '9999999999',
        password: hashedPassword,
        email_verified: true,
        status: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' }, {});
  }
};
