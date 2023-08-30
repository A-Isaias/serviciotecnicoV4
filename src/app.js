const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // Importar el módulo multer

const port = 3000;
const app = express();

// Configurar el middleware para la carga de archivos utilizando multer
const upload = multer({ dest: path.join(__dirname, 'public', 'img') });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
    const servicios = JSON.parse(archivoJSON);
    res.render('index', { servicios, fixedHeader: true });
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
        if (req.files && req.files.foto) {
            const nuevaFoto = req.files.foto;
            const extension = nuevaFoto.name.split('.').pop();
            const nuevaFotoNombre = `photo_${Date.now()}.${extension}`;
            nuevaFoto.mv(path.join(__dirname, 'public', 'img', nuevaFotoNombre), err => {
                if (err) {
                    console.error('Error al cargar la nueva foto:', err);
                } else {
                    updatedServicio.foto = nuevaFotoNombre; // Actualizar la foto si se cargó exitosamente
                }
            });
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

    res.redirect('/search');
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

app.use(express.static('public'));

app.listen(port, () => {
    console.log('Servidor iniciado en el puerto:', port);
});
