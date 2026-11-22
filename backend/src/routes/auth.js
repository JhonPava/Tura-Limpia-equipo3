const express = require('express');
const { requiereAutenticacion } = require('../middleware/auth');
const { login, logout, obtenerPerfil } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', login);
router.post('/logout', requiereAutenticacion, logout);
router.get('/me', requiereAutenticacion, obtenerPerfil);

module.exports = router;
