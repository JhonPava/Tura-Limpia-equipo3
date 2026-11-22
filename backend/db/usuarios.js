const bcrypt = require('bcryptjs');

const RONDAS_BCRYPT = 10;
const LONGITUD_MINIMA_PASSWORD = 8;

const normalizarCorreo = (correo) => String(correo).trim().toLowerCase();

/** Devuelve un nombre_usuario libre a partir del correo (ej. admin, admin2...). */
async function nombreUsuarioLibre(trx, correo, idUsuarioActual = null) {
  const base = correo.split('@')[0].replace(/[^a-z0-9._-]/g, '').slice(0, 45) || 'usuario';
  for (let i = 1; ; i += 1) {
    const candidato = i === 1 ? base : `${base}${i}`;
    const ocupado = await trx('usuario')
      .where({ nombre_usuario: candidato })
      .whereNot('id_usuario', idUsuarioActual ?? 0)
      .first('id_usuario');
    if (!ocupado) return candidato;
  }
}

/**
 * Crea o actualiza un usuario (buscado por correo) y le asegura un perfil activo con el rol dado.
 * Si el usuario ya existe, actualiza su contraseña, nombre y estado.
 *
 * @param {import('knex').Knex} knex
 * @returns {Promise<{ idUsuario: number, idPerfil: number, creado: boolean }>}
 */
async function guardarUsuario(knex, {
  nombres, apellidos = null, email, password, rol,
  estado = 'ACTIVO', documento = null, telefono = null, idBarrio = null,
}) {
  const correo = normalizarCorreo(email);
  if (!correo.includes('@')) throw new Error(`Correo no válido: ${email}`);
  if (!password || password.length < LONGITUD_MINIMA_PASSWORD) {
    throw new Error(`La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`);
  }

  return knex.transaction(async (trx) => {
    const rolEncontrado = await trx('rol').where({ nombre_rol: rol }).first('id_rol');
    if (!rolEncontrado) {
      throw new Error(`No existe el rol ${rol}. Ejecuta primero: npm run db:migrate && npm run db:seed`);
    }

    const datos = {
      nombres,
      apellidos,
      estado,
      contrasena_hash: await bcrypt.hash(password, RONDAS_BCRYPT),
      ...(documento && { documento }),
      ...(idBarrio && { id_barrio: idBarrio }),
    };

    const existente = await trx('usuario').whereRaw('lower(correo) = ?', [correo]).first('id_usuario');
    let idUsuario;
    if (existente) {
      idUsuario = existente.id_usuario;
      await trx('usuario').where({ id_usuario: idUsuario }).update(datos);
    } else {
      [{ id_usuario: idUsuario }] = await trx('usuario')
        .insert({ ...datos, correo, nombre_usuario: await nombreUsuarioLibre(trx, correo) })
        .returning('id_usuario');
    }

    let perfil = await trx('perfil')
      .where({ id_usuario: idUsuario, id_rol: rolEncontrado.id_rol, estado: 'ACTIVO' })
      .first('id_perfil');
    if (!perfil) {
      [perfil] = await trx('perfil')
        .insert({ id_usuario: idUsuario, id_rol: rolEncontrado.id_rol })
        .returning('id_perfil');
    }

    if (telefono) {
      await trx('usuario_telefono')
        .insert({ id_usuario: idUsuario, telefono })
        .onConflict(['id_usuario', 'telefono']).ignore();
    }

    return { idUsuario, idPerfil: perfil.id_perfil, creado: !existente };
  });
}

module.exports = { guardarUsuario, normalizarCorreo, LONGITUD_MINIMA_PASSWORD };
