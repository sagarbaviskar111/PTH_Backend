// routes/departmentRoutes.js
const express = require('express');
const { createDepartment, getDepartments,deleteDepartment } = require('../controllers/departmentController');
const authenticateToken = require('../middleware/authMiddleware');
const { departmentValidationRules } = require('../utils/validators');
const validate = require('../middleware/validate');


const router = express.Router();

router.post('/', authenticateToken, departmentValidationRules(), validate, createDepartment);
router.get('/', getDepartments);
router.delete('/:id', authenticateToken, deleteDepartment);

module.exports = router;
