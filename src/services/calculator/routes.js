const express = require('express');
const router = express.Router();
const calculatorController = require('./controller');
const { validateToken, hasRoles } = require('../../middleware/auth');

// Apply authentication middleware to all calculator routes
router.use(validateToken);

// Basic operations
router.post('/add', calculatorController.add);
router.post('/subtract', calculatorController.subtract);
router.post('/multiply', calculatorController.multiply);
router.post('/divide', calculatorController.divide);

// Advanced operations
router.post('/power', calculatorController.power);
router.post('/sqrt', calculatorController.sqrt);

// History
router.get('/history', calculatorController.getHistory);

module.exports = router;
