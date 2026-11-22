/**
 * Vista para el login y los permisos: datos del usuario con sus roles vigentes.
 *
 *   SELECT * FROM v_usuario_roles WHERE lower(correo) = lower($1);
 *   -- roles es un arreglo, ej. {ADMIN}; el backend valida 'ADMIN' = ANY(roles)
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  await knex.raw(`
    CREATE VIEW v_usuario_roles AS
    SELECT u.id_usuario,
           u.correo,
           u.nombre_usuario,
           trim(u.nombres || ' ' || coalesce(u.apellidos, '')) AS nombre,
           u.contrasena_hash,
           u.estado,
           coalesce(array_agg(r.nombre_rol ORDER BY r.nombre_rol)
                    FILTER (WHERE r.id_rol IS NOT NULL), '{}') AS roles
      FROM usuario u
      LEFT JOIN perfil p ON p.id_usuario = u.id_usuario
                        AND p.estado = 'ACTIVO'
                        AND (p.fecha_fin IS NULL OR p.fecha_fin >= CURRENT_DATE)
      LEFT JOIN rol r    ON r.id_rol = p.id_rol AND r.estado = 'ACTIVO'
     GROUP BY u.id_usuario`);
};

/** @param {import('knex').Knex} knex */
exports.down = async (knex) => {
  await knex.raw('DROP VIEW IF EXISTS v_usuario_roles');
};
