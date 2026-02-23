const controller = {};
const { Organization, Department, Designation, VisitingOfficer, Role } = require('../../models')
const { Op, fn, col, where } = require('sequelize');
const ApiError = require('../../utils/ApiError')
const ApiResponse = require('../../utils/ApiResponse')
const { query, validationResult } = require('express-validator');

controller.roles = async (req, res) => {
  try{
    const roles = await Role.findAll({
      attributes: ['id', 'name'],
      where: { deletedAt: null },
    });
    return res.status(200).json(new ApiResponse(200, roles, "Roles fetched successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.createRole = async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { name, organization_id, department_id, designation_id, visiting_officer_id, description, status } = req.body;
    const exist = await Role.findOne({
      where: {
        organization_id,
        department_id,
        designation_id,
        visiting_officer_id,
        name: { [Op.iLike]: name.trim() },
      }
    });
    if (exist) {
      return res.status(409).json(
        new ApiResponse(409, null, "Role already exists with the same organization, department, designation, and visiting officer")
      );
    }
    const newRole = await Role.create({
      name: name.trim(),
      organization_id,
      department_id,
      designation_id,
      visiting_officer_id,
      description: description || null,
      status: status || '0',
    });
    return res.status(201).json(new ApiResponse(201, newRole, "Role created successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, organization_id, department_id, designation_id, visiting_officer_id, description, status, } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json(new ApiResponse(404, null, "Role not found"));
    }

    await role.update({
      name: name?.trim() || role.name,
      organization_id: organization_id || role.organization_id,
      department_id: department_id || role.department_id,
      designation_id: designation_id || role.designation_id,
      visiting_officer_id: visiting_officer_id || role.visiting_officer_id,
      description: description ?? role.description,
      status: status || role.status,
    });
    return res.status(200).json(new ApiResponse(200, role, "Role updated successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json(new ApiResponse(404, null, "Role not found"));
    }
    await role.destroy();
    return res.status(200).json(new ApiResponse(200, null, "Role deleted successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.organizationList = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let filter = { status: '1' };
    if (name) {
      filter[Op.or] = [
         where(fn('LOWER', col('name')), 'LIKE', `%${name.toLowerCase()}%`)
      ];
    }
    const { count, rows: organizations } = await Organization.findAndCountAll({
      where: filter,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(
      new ApiResponse(200, organizations, "Organizations fetched successfully", count, parseInt(limit))
    );
  } catch (error) {
    return res.status(500).json(
      new ApiError(500, "Something went wrong!", [error.message])
    );
  }
};

controller.storeOrganization = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { name, status } = req.body;
        const exist = await Organization.findOne({
            where: {
                name: { [Op.iLike]: name.trim() }
            }
        });
        if (exist) {
            return res.status(409).json(new ApiResponse(409, null, "Organization already exists"));
        }
        const newOrganization = await Organization.create({
            name,
            status: status || '0',
        });
        return res.status(200).json(new ApiResponse(200, newOrganization, "Organization created successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
    }
};

controller.updateOrganization = async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { id } = req.params;
    const { name, status } = req.body;
    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json(new ApiResponse(404, null, "Organization not found"));
    }
    const nameExists = await Organization.findOne({
      where: {
        name: { [Op.iLike]: name.trim() },
        id: { [Op.ne]: id }
      }
    });
    if (nameExists) {
      return res.status(409).json(new ApiResponse(409, null, "Another organization with this name already exists"));
    }
    organization.name = name.trim();
    organization.status = status ?? organization.status;
    await organization.save();
    return res.status(200).json(new ApiResponse(200, organization, "Organization updated successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.viewOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json(new ApiResponse(404, null, "Organization not found"));
    }
    return res.status(200).json(new ApiResponse(200, organization, "Organization fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json(new ApiResponse(404, null, "Organization not found"));
    }
    await organization.destroy();
    return res.status(200).json(new ApiResponse(200, null, "Organization deleted successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.departmentList = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let filter = { status: '1' };
    if (name) {
      filter[Op.or] = [
         where(fn('LOWER', col('Department.name')), 'LIKE', `%${name.toLowerCase()}%`)
      ];
    }
    const { count, rows: departments } = await Department.findAndCountAll({
      where: filter,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name']
        }
      ]
    });
    return res.status(200).json(
      new ApiResponse(200, departments, "Departments fetched successfully", count, parseInt(limit))
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Something went wrong!", [error.message])
    );
  }
};

controller.storeDepartment = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { name, organization_id, status } = req.body;
        const exist = await Department.findOne({
            where: {
                organization_id: organization_id,
                name: { [Op.iLike]: name.trim() },
            }
        });
        if (exist) {
            return res.status(409).json(new ApiResponse(409, null, "Department already exists"));
        }
        const newDepartment = await Department.create({
            name,
            organization_id,
            status: status || '0',
        });
        return res.status(200).json(new ApiResponse(200, newDepartment, "Department created successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
    }
};

controller.updateDepartment = async (req, res) => {
  try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
          return res.status(400).json({ errors: result.array() });
      }
      const { id } = req.params;
      const { name, organization_id, status } = req.body;
      const trimmedName = name.trim().toLowerCase();
      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json(new ApiResponse(404, null, "Department not found"));
      }
      const duplicate = await Department.findOne({
      where: {
        id: { [Op.ne]: id },
        organization_id,
        [Op.and]: [
          where(fn('LOWER', col('Department.name')), {
            [Op.like]: trimmedName
          })
        ]
      }
    });
    if (duplicate) {
      return res.status(409).json(new ApiResponse(409, null, "Another department with the same name already exists"));
    }
    department.name = name.trim();
    department.organization_id = organization_id;
    department.status = status ?? department.status;
    await department.save();
    return res.status(200).json(new ApiResponse(200, department, "Department updated successfully"));
  } catch {
    res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.departmentsByOrganization = async (req, res) => {
  try {
    const { organization_id } = req.params;
    const { name, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let filter = {
      organization_id,
      status: '1',
    };
    if (name) {
      filter[Op.and] = [
        where(fn('LOWER', col('Department.name')), {
          [Op.like]: `%${name.toLowerCase()}%`
        })
      ];
    }
    const { count, rows: departments } = await Department.findAndCountAll({
      where: filter,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name']
        }
      ]
    });
    return res.status(200).json(
      new ApiResponse(200, departments, "Departments fetched successfully", count, parseInt(limit))
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.viewDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id, {
      include: [
        {
          model: Organization,
          as: "organization",
          attributes: ["id", "name"]
        }
      ]
    });
    if (!department) {
      return res.status(404).json(new ApiResponse(404, null, "Department not found"));
    }
    return res.status(200).json(new ApiResponse(200, department, "Department details fetched successfully"));
  } catch (error) {
    console.error("View Department Error:", error);
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json(new ApiResponse(404, null, "Department not found"));
    }
    await department.destroy();
    return res.status(200).json(new ApiResponse(200, null, "Department deleted successfully"));
  } catch (error) {
    console.error("Delete Department Error:", error);
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.designationsList = async (req, res) => {
  try {
    const { name } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let filter = { status: '1' };
    if (name) {
      filter[Op.or] = [
         where(fn('LOWER', col('Designation.name')), 'LIKE', `%${name.toLowerCase()}%`)
      ];
    }
    const { count, rows: designations } = await Designation.findAndCountAll({
      where: filter,
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"]
        }
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(
      new ApiResponse(200, designations, "Designations fetched successfully", count, limit)
    );
  } catch (error) {
    console.error("Fetch Designations Error:", error);
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.storeDesignation = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { name, department_id, status } = req.body;
        const exist = await Designation.findOne({
            where: {
                department_id: department_id,
                name: { [Op.iLike]: name.trim() },
            }
        });
        if (exist) {
          return res.status(409).json(new ApiResponse(409, null, "Designation already exists"));
        }
        const newDesignation = await Designation.create({
            name,
            department_id,
            status: status || '0',
        });
        return res.status(200).json(new ApiResponse(200, newDesignation, "Designation created successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
    }
};

controller.updateDesignation = async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { id } = req.params;
    const { name, department_id, status } = req.body;
    const designation = await Designation.findByPk(id);
    if (!designation) {
      return res.status(404).json(new ApiResponse(404, null, "Designation not found"));
    }
    const exist = await Designation.findOne({
      where: {
        id: { [Op.ne]: id },
        department_id,
        name: { [Op.iLike]: name.trim() }
      }
    });
    if (exist) {
      return res.status(409).json(new ApiResponse(409, null, "Designation with the same name already exists"));
    }
    designation.name = name;
    designation.department_id = department_id;
    designation.status = status || '0';
    await designation.save();
    return res.status(200).json(new ApiResponse(200, designation, "Designation updated successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.designationsByDepartmentId = async (req, res) => {
  try {
    const { department_id } = req.params;
    const { name, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let filter = {
      department_id,
      status: '1',
    };
    if (name) {
      filter[Op.and] = [
        where(fn('LOWER', col('Designation.name')), {
          [Op.like]: `%${name.toLowerCase()}%`
        })
      ];
    }
    const { count, rows: designations } = await Designation.findAndCountAll({
      where: filter,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ]
    });
    return res.status(200).json(new ApiResponse(200, designations, "Designation fetched successfully by organization"));
  } catch (error) {
    console.error("Designation by organization error:", error);
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.viewDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
      ],
    });
    if (!designation) {
      return res.status(404).json(new ApiResponse(404, null, "Designation not found"));
    }
    return res.status(200).json(new ApiResponse(200, designation, "Designation fetched successfully"));
  } catch (error) {
    console.error("View Designation Error:", error);
    res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findByPk(id);
    if (!designation) {
      return res.status(404).json(new ApiResponse(404, null, "Designation not found"));
    }
    await designation.destroy();
    return res.status(200).json(new ApiResponse(200, null, "Designation deleted successfully"));
  } catch (error) {
    console.error("Delete Designation Error:", error);
    res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.visitingOfficersList = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let filter = { status: '1' };
    if (name) {
      filter[Op.and] = [
        where(fn('LOWER', col('VisitingOfficer.name')), {
          [Op.like]: `%${name.toLowerCase()}%`
        })
      ];
    }
    const { count, rows: visitingOfficers } = await VisitingOfficer.findAndCountAll({
      where: filter,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Designation,
          as: 'designation',
          attributes: ['id', 'name'],
        }
      ]
    });
    return res.status(200).json(new ApiResponse(200, visitingOfficers, "Visiting Officers fetched successfully", count, parseInt(limit)));
  } catch (error) {
    console.error("Fetch Visiting Officers Error:", error);
    res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.visitingOfficersStore = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { name, designation_id, status } = req.body;
        const exist = await VisitingOfficer.findOne({
            where: {
                designation_id: designation_id,
                name: { [Op.iLike]: name.trim() },
            }
        });
        if (exist) {
          return res.status(409).json(new ApiResponse(409, null, "VisitingOfficer already exists"));
        }
        const newVisitingOfficer = await VisitingOfficer.create({
            name,
            designation_id,
            status: status || '0',
        });
        return res.status(200).json(new ApiResponse(200, newVisitingOfficer, "VisitingOfficer created successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
    }
};

controller.updateVisitingOfficer = async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { id } = req.params;
    const { name, designation_id, status } = req.body;
    const visitingOfficer = await VisitingOfficer.findByPk(id);
    if (!visitingOfficer) {
      return res.status(404).json(new ApiResponse(404, null, "Visiting Officer not found"));
    }
    const exist = await VisitingOfficer.findOne({
      where: {
        id: { [Op.ne]: id },
        designation_id,
        name: { [Op.iLike]: name.trim() },
      }
    });
    if (exist) {
      return res.status(409).json(new ApiResponse(409, null, "Visiting Officer with the same name already exists"));
    }
    visitingOfficer.name = name;
    visitingOfficer.designation_id = designation_id;
    visitingOfficer.status = status || '0';
    await visitingOfficer.save();
    return res.status(200).json(new ApiResponse(200, visitingOfficer, "Visiting Officer updated successfully"));
  } catch (error) {
    console.error("Update Visiting Officer Error:", error);
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.viewVisitingOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const visitingOfficer = await VisitingOfficer.findByPk(id, {
      include: [
        {
          model: Designation,
          as: "designation",
          attributes: ["id", "name"]
        }
      ]
    });
    if (!visitingOfficer) {
      return res.status(404).json(new ApiResponse(404, null, "Visiting Officer not found"));
    }
    return res.status(200).json(new ApiResponse(200, visitingOfficer, "Visiting Officer details fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.deleteVisitingOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const visitingOfficer = await VisitingOfficer.findByPk(id);
    if (!visitingOfficer) {
      return res.status(404).json(new ApiResponse(404, null, "Visiting Officer not found"));
    }
    await visitingOfficer.destroy();
    return res.status(200).json(new ApiResponse(200, null, "Visiting Officer deleted successfully"));
  } catch (error) {
    console.error("Delete Visiting Officer Error:", error);
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

controller.visitingOfficersByDesignationId = async (req, res) => {
  try {
    const { designation_id } = req.params;
    const { name, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let filter = {
      designation_id,
      status: '1',
    };
    if (name) {
      filter[Op.and] = [
        where(fn('LOWER', col('VisitingOfficer.name')), {
          [Op.like]: `%${name.toLowerCase()}%`
        })
      ];
    }
    const { count, rows: visitingOfficers } = await VisitingOfficer.findAndCountAll({
      where: filter,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Designation,
          as: 'designation',
          attributes: ['id', 'name']
        }
      ]
    });
    return res.status(200).json(
      new ApiResponse(200, visitingOfficers, "Visiting Officers fetched successfully by designation", count, parseInt(limit))
    );
  } catch (error) {
    console.error("Visiting Officers by Designation Error:", error);
    return res.status(500).json(new ApiError(500, "Something went wrong!", [error.message]));
  }
};

module.exports = controller