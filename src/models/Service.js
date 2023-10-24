const { DataTypes } = require('sequelize');
const sequelize = require('../data/servicios.db'); // Asegúrate de que la ruta sea correcta

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fecha_ingreso: DataTypes.STRING,
  nombre_cliente: DataTypes.STRING,
  direccion: DataTypes.STRING,
  telefono: DataTypes.STRING,
  tipo_equipo: DataTypes.STRING,
  marca: DataTypes.STRING,
  modelo: DataTypes.STRING,
  numero_serie: DataTypes.STRING,
  accesorios: DataTypes.STRING,
  tareas: DataTypes.STRING,
  estado: DataTypes.STRING,
  observaciones: DataTypes.STRING,
  fecha_retiro: DataTypes.STRING,
  foto: DataTypes.STRING,
  presupuesto: DataTypes.STRING,
  reparacion: DataTypes.STRING,
  costo_total: DataTypes.STRING,
});

Service.sync(); // Esto crea la tabla en la base de datos si no existe

module.exports = Service;
