'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_aadhar_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      state_id: {
        type: Sequelize.INTEGER,
      },
      city_id: {
        type: Sequelize.INTEGER,
      },
      mode: {
        type: Sequelize.ENUM('online', 'offline'),
      },
      aadhar_number: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      dob: {
        type: Sequelize.STRING
      },
      mobile_number: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.TEXT
      },
      aadhaar_zip: {
        type: Sequelize.STRING
      },
      share_code: {
        type: Sequelize.STRING
      },
      image_path: {
        type: Sequelize.STRING
      },
      pin_code: {
        type: Sequelize.STRING,
      },
      type_of_id: {
        type: Sequelize.STRING,
      },
      id_image: {
        type: Sequelize.STRING,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_aadhar_details');
  }
};