import { Navigate, Route, Routes } from 'react-router-dom';
import RutaProtegida from './auth/RutaProtegida.jsx';
import Panel from './components/Panel.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ModuloPendiente from './pages/ModuloPendiente.jsx';
import ListaVehiculos from './pages/vehiculos/ListaVehiculos.jsx';
import FormularioVehiculo from './pages/vehiculos/FormularioVehiculo.jsx';
import DetalleVehiculo from './pages/vehiculos/DetalleVehiculo.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Todo lo que está aquí dentro exige sesión de administrador. */}
      <Route element={<RutaProtegida />}>
        <Route element={<Panel />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehiculos" element={<ListaVehiculos />} />
          <Route path="/vehiculos/nuevo" element={<FormularioVehiculo />} />
          <Route path="/vehiculos/:id" element={<DetalleVehiculo />} />
          <Route path="/vehiculos/:id/editar" element={<FormularioVehiculo />} />
          <Route path="/conductores" element={<ModuloPendiente clave="conductores" nombre="Conductores" />} />
          <Route path="/rutas" element={<ModuloPendiente clave="rutas" nombre="Rutas" />} />
          <Route path="/programacion" element={<ModuloPendiente clave="programacion" nombre="Programación" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
