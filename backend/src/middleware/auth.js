const jwt = require('jsonwebtoken');
const knex = require('../db');
const { crearError } = require('./errors');

function secretoJwt() {
  if (!process.env.JWT_SECRET) {
    throw crearError(500, 'CONFIGURACION_INCOMPLETA', 'Falta JWT_SECRET.');
  }
  return process.env.JWT_SECRET;
}

async function requiereAutenticacion(req, res, next) {
  try {
    const encabezado = req.get('authorization');
    if (!encabezado?.startsWith('Bearer ')) {
      throw crearError(401, 'NO_AUTENTICADO', 'Debes iniciar sesión para continuar.');
    }

    const token = encabezado.slice(7).trim();
    let payload;
    try {
      payload = jwt.verify(token, secretoJwt());
    } catch {
      throw crearError(401, 'TOKEN_INVALIDO', 'Tu sesión no es válida o ha expirado.');
    }

    const sesion = await knex('sesiones')
      .join('usuario', 'usuario.id_usuario', 'sesiones.id_usuario')
      .where('sesiones.id_sesion', payload.idSesion)
      .where('sesiones.cerrada_en', null)
      .where('sesiones.expira_en', '>', knex.fn.now())
      .where('usuario.estado', 'ACTIVO')
      .select('usuario.id_usuario', 'usuario.correo', 'usuario.nombre_usuario', 'usuario.nombres', 'usuario.apellidos')
      .first();

    if (!sesion) {
      throw crearError(401, 'TOKEN_INVALIDO', 'Tu sesión no es válida o ha expirado.');
    }

    req.token = token;
    req.idSesion = payload.idSesion;
    req.usuario = {
      idUsuario: sesion.id_usuario,
      correo: sesion.correo,
      nombreUsuario: sesion.nombre_usuario,
      nombre: `${sesion.nombres} ${sesion.apellidos || ''}`.trim(),
    };
    next();
  } catch (error) {
    next(error);
  }
}

async function requiereAdministrador(req, res, next) {
  try {
    const usuario = await knex('v_usuario_roles')
      .where({ id_usuario: req.usuario.idUsuario })
      .first();

    if (!usuario || !usuario.roles?.includes('ADMIN')) {
      throw crearError(403, 'SIN_PERMISOS', 'Esta cuenta no tiene permisos de administrador.');
    }

    req.usuario.roles = usuario.roles;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { requiereAutenticacion, requiereAdministrador };
