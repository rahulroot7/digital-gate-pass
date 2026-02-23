const { body } = require("express-validator");

module.exports = {
    organizationStore: [
        body('name').notEmpty().withMessage('Name is required'),
        body('status').optional().isIn(['0', '1', '2']).withMessage('Invalid status value')
    ],

    departmentStore: [
        body('name')
            .notEmpty().withMessage('Name is required'),

        body('organization_id')
            .notEmpty().withMessage('Organization is required')
            .isInt().withMessage('Organization ID must be an integer'),

        body('status')
            .optional()
            .isIn(['0', '1', '2']).withMessage('Invalid status value')
    ],

    designationsStore: [
        body('name')
            .notEmpty().withMessage('Name is required'),

        body('department_id')
            .notEmpty().withMessage('Organization is required')
            .isInt().withMessage('Organization ID must be an integer'),

        body('status')
            .optional()
            .isIn(['0', '1', '2']).withMessage('Invalid status value')
    ],

    visitingOfficersStore: [
        body('name')
            .notEmpty().withMessage('Name is required'),

        body('designation_id')
            .notEmpty().withMessage('Designation is required')
            .isInt().withMessage('Organization ID must be an integer'),

        body('status')
            .optional()
            .isIn(['0', '1', '2']).withMessage('Invalid status value')
    ],
    
    createRole: [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),

    body('organization_id')
        .notEmpty().withMessage('Organization is required')
        .isInt().withMessage('Organization ID must be an integer'),

    body('department_id')
        .notEmpty().withMessage('Department is required')
        .isInt().withMessage('Department ID must be an integer'),

    body('designation_id')
        .notEmpty().withMessage('Designation is required')
        .isInt().withMessage('Designation ID must be an integer'),

    body('visiting_officer_id')
        .notEmpty().withMessage('Visiting Officer is required')
        .isInt().withMessage('Visiting Officer ID must be an integer'),

    body('status')
        .optional()
        .isIn(['0', '1']).withMessage('Invalid status value')
    ],

};
