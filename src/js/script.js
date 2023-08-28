document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nombreCliente = document.querySelector('#nombre_cliente').value;
    const telefono = document.querySelector('#telefono').value;
    const tipoEquipo = document.querySelector('#tipo_equipo').value;
    const marca = document.querySelector('#marca').value;
    const modelo = document.querySelector('#modelo').value;
    const numeroSerie = document.querySelector('#numero_serie').value;
    const accesorios = document.querySelector('#accesorios').value;
    const tareas = document.querySelector('#tareas').value;

    const data = {
      nombre_cliente: nombreCliente,
      telefono: telefono,
      tipo_equipo: tipoEquipo,
      marca: marca,
      modelo: modelo,
      numero_serie: numeroSerie,
      accesorios: accesorios,
      tareas: tareas
    };

    fetch('/servicios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      console.log('Servicio cargado:', result);
      imprimirServicio(result.id); // Llamada a la función para imprimir el servicio
    })
    .catch(error => {
      console.error('Error al cargar el servicio:', error);
    });
  });

  function imprimirServicio(id) {
    fetch('/servicios/' + id)
    .then(response => response.json())
    .then(servicio => {
      const imprimir = window.open('', 'Imprimir servicio');
      imprimir.document.write(
        '<div>' +
        // Código para mostrar el servicio en la ventana de impresión
        '</div>'
      );
      imprimir.print();
      imprimir.close();
    })
    .catch(error => {
      console.error('Error al imprimir el servicio:', error);
    });
  }
});
