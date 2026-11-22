const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const knex = require('../db');
const { crearError } = require('../middleware/errors');
const { requiereAutenticacion } = require('../middleware/auth');

const router = express.Router();

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Ingresa tu correo y tu contraseña.').email('Correo electrónico no válido.'),
  password: z.string().min(1, 'Ingresa tu correo y tu contraseña.'),
});

router.post('/login', async (req, res, next) => {
  try {
    const resultado = loginSchema.safeParse(req.body);
    if (!resultado.success) {
      throw crearError(
        400,
        'DATOS_INVALIDOS',
        resultado.error.errors[0]?.message || 'Ingresa tu correo y tu contraseña.',
        resultado.error.flatten().fieldErrors,
      );
    }

    const { email, password } = resultado.data;
    const usuario = await knex('v_usuario_roles')
      .whereRaw('lower(correo) = lower(?)', [email])
      .first();

    if (!usuario || !(await bcrypt.compare(password, usuario.contrasena_hash))) {
      throw crearError(401, 'CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.');
    }

    if (usuario.estado !== 'ACTIVO') {
      throw crearError(403, 'CUENTA_DESACTIVADA', 'Tu cuenta está desactivada. Contacta al administrador.');
    }

    if (!usuario.roles?.includes('ADMIN')) {
      throw crearError(403, 'SIN_PERMISOS', 'Esta cuenta no tiene permisos de administrador.');
    }

    const expiraEn = process.env.JWT_EXPIRES_IN || '8h';
    const [sesion] = await knex('sesiones')
      .insert({
        id_usuario: usuario.id_usuario,
        expira_en: knex.raw(`now() + (?::interval)`, [expiraEn]),
        ip: req.ip,
        user_agent: req.get('user-agent'),
      })
      .returning(['id_sesion', 'expira_en']);

    const token = jwt.sign(
      { idUsuario: usuario.id_usuario, idSesion: sesion.id_sesion },
      process.env.JWT_SECRET,
      { expiresIn: expiraEn },
    );

    res.json({
      token,
      expiraEn: sesion.expira_en,
      usuario: {
        idUsuario: usuario.id_usuario,
        correo: usuario.correo,
        nombreUsuario: usuario.nombre_usuario,
        nombre: usuario.nombre,
        roles: usuario.roles,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', requiereAutenticacion, async (req, res, next) => {
  try {
    await knex('sesiones')
      .where({ id_sesion: req.idSesion })
      .whereNull('cerrada_en')
      .update({ cerrada_en: knex.fn.now() });

    res.json({ mensaje: 'Cerraste sesión correctamente.' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requiereAutenticacion, async (req, res, next) => {
  try {
    const usuario = await knex('v_usuario_roles')
      .where({ id_usuario: req.usuario.idUsuario })
      .first();

    res.json({
      usuario: {
        idUsuario: usuario.id_usuario,
        correo: usuario.correo,
        nombreUsuario: usuario.nombre_usuario,
        nombre: usuario.nombre,
        roles: usuario.roles,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
