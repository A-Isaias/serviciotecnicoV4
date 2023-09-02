const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();

// Página de inicio de sesión (GET)
router.get('/login', (req, res) => {
  res.render('login'); // Asegúrate de tener una vista "login.ejs"
});

// Procesar inicio de sesión (POST)
router.post('/login', [
  check('username').notEmpty().withMessage('El nombre de usuario es requerido'),
  check('password').notEmpty().withMessage('La contraseña es requerida')
], (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Si hay errores de validación, vuelve a renderizar la página de inicio de sesión con los errores
    return res.render('login', { errors: errors.array() });
  }

  // Verificar las credenciales (aquí puedes verificar contra tu base de datos u otro método)
  const { username, password } = req.body;

  // Definir los usuarios y sus contraseñas correspondientes
  const users = {
    usuario1: 'ariel1',
    usuario2: 'ariel2',
    usuario3: 'ariel3',
    usuario4: 'ariel4'
  };

  if (users.hasOwnProperty(username) && users[username] === password) {
    // Credenciales válidas, redirigir al usuario a la página principal correspondiente
    req.session.authenticated = true;

    // Determinar qué archivo JSON cargar según el usuario
    let jsonFile;
    switch (username) {
      case 'usuario1':
        jsonFile = 'servicios1.json';
        break;
      case 'usuario2':
        jsonFile = 'servicios2.json';
        break;
      case 'usuario3':
        jsonFile = 'servicios3.json';
        break;
      case 'usuario4':
        jsonFile = 'servicios4.json';
        break;
      default:
        jsonFile = 'servicios.json'; // Archivo predeterminado si no coincide ningún usuario
    }

    // Almacenar el nombre del archivo JSON en la sesión
    req.session.jsonFile = jsonFile;

    res.redirect('/');
  } else {
    // Credenciales inválidas, mostrar un mensaje de error
    res.render('login', { error: 'Credenciales inválidas' });
  }
});

module.exports = router;