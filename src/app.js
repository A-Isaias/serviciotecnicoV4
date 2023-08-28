const express = require('express');
const path = require('path');
const fs = require('fs');

const port = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
    const servicios = JSON.parse(archivoJSON);
    res.render('index', { servicios });
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

    res.render('new', { nextId });
});

app.post('/guardar-servicio', (req, res) => {
    try {
        const nuevoServicio = {
            id: parseInt(req.body.id),
            nombre_cliente: req.body.nombre_cliente,
            telefono: req.body.telefono,
            tipo_equipo: req.body.tipo_equipo,
            marca: req.body.marca,
            modelo: req.body.modelo,
            numero_serie: req.body.numero_serie,
            accesorios: req.body.accesorios,
            tareas: req.body.tareas
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

app.post('/update/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
    const servicios = JSON.parse(archivoJSON);

    const servicioIndex = servicios.findIndex(servicio => servicio.id === id);

    if (servicioIndex !== -1) {
        servicios[servicioIndex] = {
            id: id,
            nombre_cliente: req.body.nombre_cliente,
            telefono: req.body.telefono,
            tipo_equipo: req.body.tipo_equipo,
            marca: req.body.marca,
            modelo: req.body.modelo,
            numero_serie: req.body.numero_serie,
            accesorios: req.body.accesorios,
            tareas: req.body.tareas
        };

        fs.writeFileSync(path.join(__dirname, 'servicios.json'), JSON.stringify(servicios, null, 2));
    }

    res.redirect('/search');
});

app.post('/search', (req, res) => {
    const searchId = parseInt(req.body.searchId);
    const searchName = req.body.searchName.toLowerCase();

    const archivoJSON = fs.readFileSync(path.join(__dirname, 'servicios.json'), 'utf-8');
    const servicios = JSON.parse(archivoJSON);

    let searchResults = [];

    if (!isNaN(searchId)) {
        // Si se proporciona un ID válido, buscar por ID
        const resultById = servicios.find(servicio => servicio.id === searchId);
        if (resultById) {
            searchResults.push(resultById);
        }
    } else if (searchName.trim() !== '') {
        // Si se proporciona un nombre no vacío, buscar por nombre
        searchResults = servicios.filter(servicio =>
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
