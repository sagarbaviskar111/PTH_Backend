const { body } = require('express-validator');

const validateJob = [
  body('positionName').not().isEmpty().withMessage('Position name is required'),
  body('company').not().isEmpty().withMessage('Company name is required'),
  body('salary').not().isEmpty().withMessage('Salary is required'),
  body('location').not().isEmpty().withMessage('Location is required'),
  body('qualification').not().isEmpty().withMessage('Qualification is required'),
//   body('keyResponsibilities').isArray().withMessage('Key responsibilities should be an array'),
//   body('skills').isArray().withMessage('Skills should be an array'),
  body('companyOverview').not().isEmpty().withMessage('Company overview is required'),
//   body('tags').isArray().withMessage('Tags should be an array'),
//   body('applicationLinks').isArray().withMessage('Application links should be an array'),
];

module.exports = validateJob;
