const express = require('express');
const knex = require('../db');
const { requiereAutenticacion, requiereAdministrador } = require('../middleware/auth');

const router = express.Router();

router.get('/', requiereAutenticacion, requiereAdministrador, async (req, res, next) => {
  try {
    const [vehiculos, conductores, rutas, programacion] = await Promise.all([
      knex('vehiculo').count('* as total').first(),
      knex('conductor').count('* as total').first(),
      knex('macroruta').count('* as total').first(),
      knex('programacion_ruta').count('* as total').first(),
    ]);

    res.json({
      usuario: req.usuario,
      modulos: [
        { nombre: 'Vehículos', ruta: '/vehiculos', total: Number(vehiculos.total) },
        { nombre: 'Conductores', ruta: '/conductores', total: Number(conductores.total) },
        { nombre: 'Rutas', ruta: '/rutas', total: Number(rutas.total) },
        { nombre: 'Programación', ruta: '/programacion', total: Number(programacion.total) },
      ],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
