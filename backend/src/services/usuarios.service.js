import bcrypt from 'bcryptjs';

// Crea el usuario o, si el correo ya existe, actualiza su nombre, rol, contraseña y estado.
// Recibe la conexión `db` para poder usarse desde el seed, el script y la app.
export async function crearOActualizarUsuario(db, { nombre, email, password, rol, activo = true }) {
  if (!email || !password) throw new Error('Se requieren correo y contraseña.');
  if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');

  const fila = {
    nombre,
    email: email.trim().toLowerCase(),
    password_hash: await bcrypt.hash(password, 10),
    rol,
    activo,
    actualizado_en: db.fn.now(),
  };

  const [usuario] = await db('usuarios')
    .insert(fila)
    .onConflict('email')
    .merge(['nombre', 'password_hash', 'rol', 'activo', 'actualizado_en'])
    .returning(['id', 'nombre', 'email', 'rol', 'activo']);
  return usuario;
}
