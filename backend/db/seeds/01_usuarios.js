// Datos mínimos de prueba. Se ejecuta con: npm run db:seed
//
// Crea:
//  - El administrador inicial (datos ADMIN_* del archivo .env)
//  - Un usuario OPERADOR sin permisos de administrador, para comprobar que el
//    panel rechaza a quien no es administrador.
//  - Un administrador inactivo, para comprobar el mensaje de cuenta desactivada.
//
// Se puede ejecutar varias veces: si el correo ya existe, lo actualiza.
import 'dotenv/config';
import { crearOActualizarUsuario } from '../../src/services/usuarios.service.js';

export const USUARIOS_PRUEBA = [
  {
    nombre: process.env.ADMIN_NOMBRE || 'Administrador Tura Limpia',
    email: process.env.ADMIN_EMAIL || 'admin@turalimpia.co',
    password: process.env.ADMIN_PASSWORD || 'Admin123*',
    rol: 'ADMIN',
  },
  {
    nombre: 'Operador de prueba',
    email: 'operador@turalimpia.co',
    password: 'Operador123*',
    rol: 'OPERADOR',
  },
  {
    nombre: 'Administrador inactivo de prueba',
    email: 'inactivo@turalimpia.co',
    password: 'Inactivo123*',
    rol: 'ADMIN',
    activo: false,
  },
];

export async function seed(knex) {
  for (const datos of USUARIOS_PRUEBA) {
    const u = await crearOActualizarUsuario(knex, datos);
    console.log(`✔ ${u.rol.padEnd(8)} ${u.email}${u.activo ? '' : ' (inactivo)'}`);
  }
}
