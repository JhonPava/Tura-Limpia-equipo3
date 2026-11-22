const express = require('express');
const { requiereAutenticacion, requiereAdministrador } = require('../middleware/auth');
const { obtenerDashboard } = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/', requiereAutenticacion, requiereAdministrador, obtenerDashboard);

module.exports = router;
