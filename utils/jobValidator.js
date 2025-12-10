const { body } = require('express-validator');

// Validator for creating a job (required fields)
const validateJobCreate = [
  body('positionName').not().isEmpty().withMessage('Position name is required'),
  body('company').not().isEmpty().withMessage('Company name is required'),
  body('salary').not().isEmpty().withMessage('Salary is required'),
  body('location').not().isEmpty().withMessage('Location is required'),
  body('qualification').not().isEmpty().withMessage('Qualification is required'),
  body('companyOverview').not().isEmpty().withMessage('Company overview is required'),
];

// Validator for updating a job (all fields optional but validated when present)
const validateJobUpdate = [
  body('positionName').optional().isString().withMessage('Position name must be a string'),
  body('company').optional().isString().withMessage('Company name must be a string'),
  body('salary').optional().isString().withMessage('Salary must be a string'),
  body('location').optional().isString().withMessage('Location must be a string'),
  body('qualification').optional().isString().withMessage('Qualification must be a string'),
  body('companyOverview').optional().isString().withMessage('Company overview must be a string'),
];

module.exports = { validateJobCreate, validateJobUpdate };
