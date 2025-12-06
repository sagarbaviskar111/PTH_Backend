// utils/validators.js
const { body } = require('express-validator');

const jobValidationRules = () => [
    body('company').notEmpty().withMessage('Company is required'),
    body('positionName').notEmpty().withMessage('Position name is required'),
];

const departmentValidationRules = () => [
    body('name').notEmpty().withMessage('Department name is required')
];

module.exports = {
    jobValidationRules,
    departmentValidationRules
};
