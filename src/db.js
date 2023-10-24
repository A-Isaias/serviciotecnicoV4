const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('servicios.db', 'root', '123456789', {
  host: 'localhost', // Cambia esto según tu configuración de MySQL
  dialect: 'mysql',
});

// Verifica la conexión a la base de datos
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
})();

module.exports = sequelize;
