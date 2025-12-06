// controllers/departmentController.js
const Department = require('../models/Department');

const createDepartment = async (req, res) => {
    try {
        const department = new Department(req.body);
        await department.save();
        res.status(201).json({ message: 'Department added successfully', department });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.status(200).json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteDepartment = async (req, res) => {
    const { id } = req.params;

    console.log(id)
    try {
        const department = await Department.findByIdAndDelete(id); // Adjust based on your ORM/DB

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        return res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error('Error deleting department:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createDepartment, getDepartments,deleteDepartment };
