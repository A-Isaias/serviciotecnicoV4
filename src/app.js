const express = require('express');
const session = require('express-session'); 
const path = require('path');
const fs = require('fs');
const multer = require('multer'); 
const backupFolder = 'backups'; // Carpeta donde se guarda backup de la db

const port = 3000;
const app = express();
const password = '1422'; 

// Configura express-session
app.use(session({
    secret: 'ariel1975', // Cambia esto por una cadena secreta más segura
    resave: false,
    saveUninitialized: true
}));


// Configurar el middleware para la carga de archivos utilizando multer
const upload = multer({ dest: path.join(__dirname, 'public', 'img') });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Comprueba si el archivo 'servicios.json' existe, y si no, créalo vacío.
const serviciosFilePath = path.join(__dirname, 'servicios.json');
if (!fs.existsSync(serviciosFilePath)) {
  fs.writeFileSync(serviciosFilePath, '[]', 'utf-8');
}

// Ruta para procesar el formulario de inicio de sesión
app.post('/login', (req, res) => {
    const providedPassword = req.body.password; // Obtén la contraseña proporcionada en el formulario

    // Verifica si la contraseña proporcionada coincide con la contraseña configurada
    if (providedPassword === password) {
        // La contraseña es correcta, marca al usuario como autenticado en la sesión
        req.session.authenticated = true;
        res.redirect('/'); // Redirige a la vista principal
    } else {
        // La contraseña es incorrecta, muestra un mensaje de error
        res.render('login', { errorMessage: 'Invalid Password.' });
    }
});

// Ruta para pedir la contraseña una vez
app.get('/login', (req, res) => {
    // Verifica si el usuario ya está autenticado en una sesión
    if (req.session.authenticated) {
        // El usuario ya está autenticado, redirige a la vista principal
        res.redirect('/');
    } else {
        // El usuario no está autenticado, muestra el formulario de inicio de sesión
        res.render('login', { errorMessage: null }); // Pasamos errorMessage como nulo por defecto
    }
});


// Protege la vista principal utilizando la autenticación basada en sesiones
app.get('/', (req, res) => {
    // Verifica si el usuario está autenticado en una sesión
    if (req.session.authenticated) {
        // El usuario está autenticado, muestra la vista principal
        const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
        const servicios = JSON.parse(archivoJSON);
        res.render('index', { servicios, fixedHeader: true });
    } else {
        // El usuario no está autenticado, redirige a la página de inicio de sesión
        res.redirect('/login');
    }
});

//vista que muestra toda la base de datos
app.get('/database', (req, res) => {
    res.render('database'); // Renderiza la vista database.ejs
});

app.get('/servicios', (req, res) => {
    const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
    const servicios = JSON.parse(archivoJSON);
    res.json(servicios);
});

app.get('/new', (req, res) => {
    const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
    const servicios = JSON.parse(archivoJSON);

    const lastId = servicios[servicios.length - 1].id;
    const nextId = lastId + 1;

    // Agregar la fecha de ingreso actual en el formato DD-MM-AAAA
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    res.render('new', { nextId, formattedDate }); // Pasar la fecha a la vista
});

app.post('/guardar-servicio', upload.single('foto'), (req, res) => {
    try {
        const nuevoServicio = {
            id: parseInt(req.body.id),
            fecha_ingreso: req.body.fecha_ingreso, // Agregar la fecha de ingreso
            nombre_cliente: req.body.nombre_cliente,
            telefono: req.body.telefono,
            tipo_equipo: req.body.tipo_equipo,
            marca: req.body.marca,
            modelo: req.body.modelo,
            numero_serie: req.body.numero_serie,
            accesorios: req.body.accesorios,
            tareas: req.body.tareas,
            estado: req.body.estado,
            observaciones: req.body.observaciones || "",
            fecha_retiro: "",

            // El campo "foto" ahora se manejará en req.file
            foto: req.file ? req.file.filename : "" // Usar req.file.filename para obtener el nombre del archivo
        };

        const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
        const servicios = JSON.parse(archivoJSON);

        servicios.push(nuevoServicio);

        fs.writeFileSync(path.join(__dirname, 'servicios.json'), JSON.stringify(servicios, null, 2));

        res.render('print', { order: nuevoServicio });
    } catch (error) {
        console.error('Error al guardar los datos:', error);
        res.status(500).send('Error al guardar los datos: ' + error.message);
    }
});

app.get('/edit', (req, res) => {
    res.render('edit');
});

app.get('/edit/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
    const servicios = JSON.parse(archivoJSON);

    const servicio = servicios.find(servicio => servicio.id === id);

    res.render('edit', { servicio });
});

app.post('/update/:id', upload.single('foto'), (req, res) => {
    const id = parseInt(req.params.id);

    const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
    const servicios = JSON.parse(archivoJSON);

    const servicioIndex = servicios.findIndex(servicio => servicio.id === id);

    if (servicioIndex !== -1) {
        const updatedServicio = {
            ...servicios[servicioIndex], // Mantener los valores existentes
            nombre_cliente: req.body.nombre_cliente,
            telefono: req.body.telefono,
            tipo_equipo: req.body.tipo_equipo,
            marca: req.body.marca,
            modelo: req.body.modelo,
            numero_serie: req.body.numero_serie,
            accesorios: req.body.accesorios,
            tareas: req.body.tareas,
            estado: req.body.estado,
            observaciones: req.body.observaciones || "",
        };

        // Manejar la carga de una nueva foto si se proporciona
        if (req.file) {
            const nuevaFoto = req.file;
            const extension = nuevaFoto.originalname.split('.').pop();
            const nuevaFotoNombre = `photo_${Date.now()}.${extension}`;

            const destinoFoto = path.join(__dirname, 'public', 'img', nuevaFotoNombre);
            fs.renameSync(nuevaFoto.path, destinoFoto);
            updatedServicio.foto = nuevaFotoNombre;
            console.log('Foto cargada exitosamente:', nuevaFotoNombre);
        }

         // Agregar la fecha de retiro si el estado es "RETIRADO"
        if (req.body.estado === "RETIRADO") {
            updatedServicio.fecha_retiro = req.body.fecha_retiro || req.body.current_date;
        } else {
            updatedServicio.fecha_retiro = ""; // Limpiar la fecha de retiro
        }

        servicios[servicioIndex] = updatedServicio;

        fs.writeFileSync(path.join(__dirname, 'servicios.json'), JSON.stringify(servicios, null, 2));
    }

    res.redirect('/');
});



app.post('/search', (req, res) => {
    const searchId = parseInt(req.body.searchId);
    const searchName = req.body.searchName.toLowerCase();
    const selectedEstado = req.body.searchEstado; // Obtén el estado seleccionado

    const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
    const servicios = JSON.parse(archivoJSON);

    let searchResults = servicios;

    if (selectedEstado === 'PENDIENTE') {
        searchResults = servicios.filter(servicio => servicio.estado !== 'RETIRADO');
    } else if (selectedEstado === 'RETIRADO') {
        searchResults = servicios.filter(servicio => servicio.estado === 'RETIRADO');
    }

    if (!isNaN(searchId)) {
        const resultById = searchResults.find(servicio => servicio.id === searchId);
        if (resultById) {
            searchResults = [resultById];
        } else {
            searchResults = [];
        }
    } else if (searchName.trim() !== '') {
        searchResults = searchResults.filter(servicio =>
            servicio.nombre_cliente.toLowerCase().includes(searchName)
        );
    }

    res.render('search', { results: searchResults });
});

app.get('/search', (req, res) => {
    res.render('search', { results: [] }); // Pasamos una lista vacía inicialmente
});

app.post('/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
    const servicios = JSON.parse(archivoJSON);

    const servicioIndex = servicios.findIndex(servicio => servicio.id === id);

    if (servicioIndex !== -1) {
        servicios.splice(servicioIndex, 1);

        fs.writeFileSync(path.join(__dirname, 'servicios.json'), JSON.stringify(servicios, null, 2));
    }

    res.redirect('/');
});

// //funcion para confirmar la eliminacion de registros
// app.locals.confirmDelete = function(id) {
//     return `return confirm('¿Está seguro de que quiere eliminar el registro ${id}?');`;
// };

app.get('/print/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
    const servicios = JSON.parse(archivoJSON);

    const servicio = servicios.find(servicio => servicio.id === id);

    res.render('print', { order: servicio });
});

app.get('/print', (req, res) => {
    res.render('print');
});

// Ruta para realizar un respaldo del archivo JSON
app.get('/backup', (req, res) => {
    try {
        // Crear un directorio de respaldos si no existe
        const backupFolder = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder);
        }

        // Leer el contenido del archivo JSON actual
        const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');

        // Generar un nombre de archivo único para el respaldo (usando la fecha y hora actual)
        const currentDateTime = new Date().toISOString().replace(/[:.]/g, '_');
        const backupFileName = `backup_${currentDateTime}.json`;

        // Crear un nuevo archivo de respaldo en la carpeta de respaldos
        const backupFilePath = path.join(backupFolder, backupFileName);
        fs.writeFileSync(backupFilePath, archivoJSON, 'utf-8');

        // Mostrar una alerta en el navegador con un botón para volver al menú principal
        const alertHTML = `
            ('Respaldo exitoso. El archivo se guardó como ${backupFileName}');
                 `;
        res.send(alertHTML);
    } catch (error) {
        console.error('Error al realizar el respaldo:', error);

        // Mostrar una alerta de error en el navegador con un botón para volver al menú principal
        const errorHTML = `
            ('Error al realizar el respaldo: ${error.message}');
               
            
        `;
        res.send(errorHTML);
    }
});

// Configura el middleware para manejar archivos en la ruta /restore
app.post('/restore', upload.single('file'), (req, res) => {
    try {
      // Verificar que se proporcionó un archivo de respaldo
      if (!req.file) {
        throw new Error('No se proporcionó un archivo de respaldo.');
      }
  
      // Leer el contenido del archivo de respaldo
      const backupData = fs.readFileSync(req.file.path, 'utf-8');
  
      // Guardar el contenido del archivo de respaldo en el archivo de base de datos principal (servicios.json)
      fs.writeFileSync(path.join(__dirname, 'servicios.json'), backupData, 'utf-8');
  
      res.send('Carga de base de datos exitosa.');
    } catch (error) {
      console.error('Error al cargar la base de datos desde el archivo de respaldo:', error);
      res.status(500).send('Error al cargar la base de datos: ' + error.message);
    }
  });

  app.post("/delete-database", (req, res) => {
    // Aquí realizas la operación de eliminación de la base de datos
    try {
      // Supongamos que tu archivo de base de datos se llama "servicios.json"
      const serviciosFilePath = path.join(__dirname, 'servicios.json');
      
      // Elimina el archivo de base de datos si existe
      if (fs.existsSync(serviciosFilePath)) {
        fs.unlinkSync(serviciosFilePath); // Esto eliminará el archivo de base de datos
      }

      // Crea un nuevo archivo servicios.json en blanco
      fs.writeFileSync(serviciosFilePath, '[]', 'utf-8');

      res.send("La base de datos ha sido eliminada con éxito.");
    } catch (error) {
      res.status(500).send("Error al eliminar y recrear la base de datos: " + error.message);
    }
  });

app.get('/admin-db', (req, res) => {
    res.render('admin-db');
});

app.use(express.static('public'));

app.listen(port, () => {
    console.log('Servidor iniciado en el puerto:', port);
});
