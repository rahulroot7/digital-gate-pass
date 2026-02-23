'use strict';

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    visiting_officer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '0',
      comment: '0 - In-active, 1 - Active',
    },
  }, {
    paranoid: true,
    tableName: 'roles',
    timestamps: true,
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'role_id',
      as: 'users',
    });

    Role.belongsTo(models.VisitingOfficer, {
      foreignKey: 'visiting_officer_id',
      as: 'visitingOfficer',
    });

    Role.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });

    Role.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });

    Role.belongsTo(models.Designation, {
      foreignKey: 'designation_id',
      as: 'designation',
    });
  };

  return Role;
};
