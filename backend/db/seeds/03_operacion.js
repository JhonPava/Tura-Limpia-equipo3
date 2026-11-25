const { guardarUsuario } = require('../usuarios');

/**
 * Datos de prueba de la operación para el dashboard: barrios, conductores, cuadrillas,
 * vehículos, rutas, programación, asignaciones y un recorrido con GPS y novedad.
 *
 * Los sectores son los de prueba de Buenaventura (Centro, Puertos, Playita, Palo Seco,
 * Marina, Oriente). Son datos de prueba, no información oficial.
 *
 * SOLO DESARROLLO: borra y vuelve a crear los datos de operación en cada ejecución.
 *
 * @param {import('knex').Knex} knex
 */
exports.seed = async (knex) => {
  // Limpia la operación anterior (de hijas a padres); usuarios y catálogos se conservan
  for (const tabla of [
    'novedad', 'ubicacion_gps', 'cumplimiento_parada', 'ejecucion_cuadrilla', 'ejecucion_ruta',
    'asignacion', 'programacion_dia', 'programacion_ruta', 'parada_ruta', 'microruta', 'macroruta',
    'vehiculo', 'cuadrilla_trabajador', 'cuadrilla', 'conductor', 'trabajador',
  ]) {
    await knex(tabla).del();
  }

  const barrios = {};
  for (const nombre_barrio of ['Centro', 'Puertos', 'Playita', 'Palo Seco', 'Marina', 'Oriente']) {
    const existente = await knex('barrio').where({ nombre_barrio }).first('id_barrio');
    const [fila] = existente
      ? [existente]
      : await knex('barrio').insert({ nombre_barrio }).returning('id_barrio');
    barrios[nombre_barrio] = fila.id_barrio;
  }

  // Personal: usuario -> perfil -> trabajador (-> conductor)
  const personal = [
    { usuario: 'crivas', nombres: 'Carlos', apellidos: 'Rivas', rol: 'CONDUCTOR', cargo: 'Conductor', licencia: 'C2-1100000002', barrio: 'Centro' },
    { usuario: 'amosquera', nombres: 'Andrés', apellidos: 'Mosquera', rol: 'CONDUCTOR', cargo: 'Conductor', licencia: 'C2-1100000003', barrio: 'Playita' },
    { usuario: 'mangulo', nombres: 'María', apellidos: 'Angulo', rol: 'OPERADOR', cargo: 'Operaria de barrido', barrio: 'Marina' },
    { usuario: 'jvalencia', nombres: 'Jorge', apellidos: 'Valencia', rol: 'OPERADOR', cargo: 'Operario de barrido', barrio: 'Oriente' },
    { usuario: 'ariascos', nombres: 'Ana', apellidos: 'Riascos', rol: 'OPERADOR', cargo: 'Operaria de barrido', barrio: 'Palo Seco' },
    // Conductores en otros estados, para probar el dashboard (solo cuenta los ACTIVO como activos)
    { usuario: 'lcaicedo', nombres: 'Luis', apellidos: 'Caicedo', rol: 'CONDUCTOR', cargo: 'Conductor', licencia: 'C3-1100000007',
      categoria: 'C3', vencimiento: '2027-06-30', estadoConductor: 'SUSPENDIDO', barrio: 'Puertos' },
    { usuario: 'pobando', nombres: 'Pedro', apellidos: 'Obando', rol: 'CONDUCTOR', cargo: 'Conductor', licencia: 'C2-1100000008',
      categoria: 'C2', vencimiento: '2026-12-15', estadoConductor: 'INACTIVO', barrio: 'Oriente' },
  ];

  const trabajadores = {};
  const conductores = {};
  for (const [i, p] of personal.entries()) {
    const { idPerfil } = await guardarUsuario(knex, {
      nombres: p.nombres,
      apellidos: p.apellidos,
      email: `${p.usuario}@turalimpia.co`,
      password: 'Prueba123*',
      rol: p.rol,
      documento: `11000000${String(i + 2).padStart(2, '0')}`,
      telefono: `31500000${String(i + 2).padStart(2, '0')}`,
      idBarrio: barrios[p.barrio],
    });
    const [trabajador] = await knex('trabajador')
      .insert({ id_perfil: idPerfil, cargo: p.cargo }).returning('id_trabajador');
    trabajadores[p.usuario] = trabajador.id_trabajador;

    if (p.licencia) {
      const [conductor] = await knex('conductor').insert({
        id_trabajador: trabajador.id_trabajador,
        num_licencia: p.licencia,
        categoria_licencia: p.categoria ?? 'C2',
        vencimiento_licencia: p.vencimiento ?? '2028-12-31',
        estado: p.estadoConductor ?? 'ACTIVO',
      }).returning('id_conductor');
      conductores[p.usuario] = conductor.id_conductor;
    }
  }

  const cuadrillas = {};
  for (const [nombre_cuadrilla, integrantes] of [
    ['Cuadrilla Centro', ['crivas', 'mangulo', 'jvalencia']],
    ['Cuadrilla Playita', ['amosquera', 'ariascos']],
  ]) {
    const [cuadrilla] = await knex('cuadrilla')
      .insert({ nombre_cuadrilla, tipo_cuadrilla: 'BARRIDO' }).returning('id_cuadrilla');
    cuadrillas[nombre_cuadrilla] = cuadrilla.id_cuadrilla;
    await knex('cuadrilla_trabajador').insert(integrantes.map((u) => ({
      id_cuadrilla: cuadrilla.id_cuadrilla, id_trabajador: trabajadores[u], fecha_inicio: '2026-11-01',
    })));
  }

  const vehiculos = await knex('vehiculo').insert([
    { placa: 'TLP101', num_interno: 'V-01', tipo: 'COMPACTADOR', marca: 'Chevrolet', modelo: 'NPR 2022', capacidad_ton: 8.5, fecha_adquisicion: '2022-03-15', estado_operativo: 'EN_SERVICIO' },
    { placa: 'TLP102', num_interno: 'V-02', tipo: 'COMPACTADOR', marca: 'Hino', modelo: '500 2023', capacidad_ton: 12, fecha_adquisicion: '2023-07-01' },
    { placa: 'TLP103', num_interno: 'V-03', tipo: 'VOLQUETA', marca: 'International', modelo: '4300 2019', capacidad_ton: 10, fecha_adquisicion: '2019-05-20', estado_operativo: 'MANTENIMIENTO' },
    { placa: 'TLP104', num_interno: 'V-04', tipo: 'COMPACTADOR', marca: 'Chevrolet', modelo: 'FRR 2021', capacidad_ton: 9, fecha_adquisicion: '2021-02-10', estado_operativo: 'FUERA_SERVICIO' },
    { placa: 'TLP105', num_interno: 'V-05', tipo: 'VOLQUETA', marca: 'Hino', modelo: '300 2024', capacidad_ton: 6, fecha_adquisicion: '2024-01-22' },
    { placa: 'TLP106', num_interno: 'V-06', tipo: 'MINICARGADOR', marca: 'Bobcat', modelo: 'S450 2020', capacidad_ton: 1.5, fecha_adquisicion: '2020-09-05', estado_operativo: 'MANTENIMIENTO' },
    // Vehículo desactivado: queda guardado pero no cuenta en el dashboard
    { placa: 'TLP099', num_interno: 'V-99', tipo: 'VOLQUETA', marca: 'Ford', modelo: 'F-600 2012', capacidad_ton: 7, fecha_adquisicion: '2012-04-18', estado_operativo: 'FUERA_SERVICIO', activo: false },
  ]).returning('id_vehiculo');

  // Rutas: macroruta -> microruta -> paradas; programación con días de servicio
  const rutas = [
    { macro: 'Barrido Centro y Puertos', micro: 'Centro - Puertos', cuadrilla: 'Cuadrilla Centro', dias: [1, 2, 3, 4, 5, 6],
      paradas: [['Centro', '06:30'], ['Puertos', '08:00']] },
    { macro: 'Barrido Playita y Palo Seco', micro: 'Playita - Palo Seco', cuadrilla: 'Cuadrilla Playita', dias: [1, 4],
      paradas: [['Playita', '06:30'], ['Palo Seco', '08:30']] },
    { macro: 'Barrido Marina y Oriente', micro: 'Marina - Oriente', cuadrilla: 'Cuadrilla Playita', dias: [2, 5],
      paradas: [['Marina', '14:30'], ['Oriente', '16:00']] },
  ];

  const programaciones = [];
  for (const r of rutas) {
    const [macroruta] = await knex('macroruta')
      .insert({ nombre_macroruta: r.macro, descripcion: `Ruta de prueba: ${r.micro}`, tipo_servicio: 'BARRIDO' })
      .returning('id_macroruta');
    const [microruta] = await knex('microruta')
      .insert({ id_macroruta: macroruta.id_macroruta, nombre_microruta: r.micro })
      .returning('id_microruta');
    await knex('parada_ruta').insert(r.paradas.map(([barrio, hora], i) => ({
      id_microruta: microruta.id_microruta,
      id_barrio: barrios[barrio],
      orden_visita: i + 1,
      hora_estimada_llegada: hora,
    })));
    const [programacion] = await knex('programacion_ruta').insert({
      id_macroruta: macroruta.id_macroruta,
      id_cuadrilla: cuadrillas[r.cuadrilla],
      vigencia_desde: '2026-11-01',
      vigencia_hasta: '2026-12-31',
    }).returning('id_programacion');
    await knex('programacion_dia').insert(r.dias.map((id_dia) => ({
      id_programacion: programacion.id_programacion, id_dia,
    })));
    programaciones.push({ ...programacion, ...microruta, id_cuadrilla: cuadrillas[r.cuadrilla] });
  }

  const turnos = Object.fromEntries(
    (await knex('turno').select('nombre_turno', 'id_turno')).map((t) => [t.nombre_turno, t.id_turno]),
  );

  const [asignacionCentro] = await knex('asignacion').insert([
    { id_programacion: programaciones[0].id_programacion, id_turno: turnos['MAÑANA'], id_vehiculo: vehiculos[0].id_vehiculo,
      id_conductor: conductores.crivas, fecha: '2026-11-23', estado: 'COMPLETADA' },
    { id_programacion: programaciones[1].id_programacion, id_turno: turnos['MAÑANA'], id_vehiculo: vehiculos[1].id_vehiculo,
      id_conductor: conductores.amosquera, fecha: '2026-11-23' },
    { id_programacion: programaciones[2].id_programacion, id_turno: turnos['TARDE'], id_vehiculo: vehiculos[1].id_vehiculo,
      id_conductor: conductores.amosquera, fecha: '2026-11-24' },
  ]).returning('id_asignacion');

  // Recorrido realizado de la ruta Centro - Puertos
  const [ejecucion] = await knex('ejecucion_ruta').insert({
    id_asignacion: asignacionCentro.id_asignacion,
    fecha_hora_inicio: '2026-11-23T06:05:00-05:00',
    fecha_hora_fin: '2026-11-23T09:40:00-05:00',
    estado: 'FINALIZADA',
    observaciones: 'Recorrido completo',
  }).returning('id_ejecucion');

  await knex('ejecucion_cuadrilla').insert({
    id_ejecucion: ejecucion.id_ejecucion, id_cuadrilla: programaciones[0].id_cuadrilla,
    hora_inicio: '06:05', hora_fin: '09:40',
  });

  const paradasCentro = await knex('parada_ruta')
    .where({ id_microruta: programaciones[0].id_microruta }).orderBy('orden_visita');
  await knex('cumplimiento_parada').insert(paradasCentro.map((p) => ({
    id_ejecucion: ejecucion.id_ejecucion,
    id_parada: p.id_parada,
    hora_llegada_real: knex.raw(
      "(?::date + ?::time + interval '10 minutes') AT TIME ZONE 'America/Bogota'",
      ['2026-11-23', p.hora_estimada_llegada],
    ),
  })));

  await knex('ubicacion_gps').insert([
    ['06:10', 3.883300, -77.068000, 18],
    ['06:50', 3.886100, -77.062100, 12.5],
    ['08:00', 3.890500, -77.075100, 0],
  ].map(([hora, latitud, longitud, velocidad]) => ({
    id_ejecucion: ejecucion.id_ejecucion,
    fecha_hora: `2026-11-23T${hora}:00-05:00`,
    latitud,
    longitud,
    velocidad,
  })));

  const perfilOperador = await knex('perfil as p')
    .join('usuario as u', 'u.id_usuario', 'p.id_usuario')
    .where('u.correo', 'operador@turalimpia.co')
    .first('p.id_perfil');
  if (perfilOperador) {
    await knex('novedad').insert({
      id_perfil: perfilOperador.id_perfil,
      id_ejecucion: ejecucion.id_ejecucion,
      tipo_novedad: 'BLOQUEO_VIA',
      descripcion: 'Vía cerrada por obras, se tomó un desvío',
      direccion_ref: 'Calle 2 con Carrera 3, Centro',
      fecha_hora: '2026-11-23T06:55:00-05:00',
    });
  }
};
