document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired'); // Nuevo console log
    
    const searchForm = document.getElementById('searchForm');
    const searchResult = document.getElementById('searchResult');

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        console.log('Form submitted'); // Nuevo console log
        
        const searchId = document.getElementById('searchId').value;
        const searchName = document.getElementById('searchName').value;

        console.log('Search ID:', searchId);
        console.log('Search Name:', searchName);

        const response = await fetch(`/buscar?searchId=${searchId}&searchName=${searchName}`);
        const data = await response.json();

        console.log('Search Result:', data);

        searchResult.innerHTML = '';
        if (data.length > 0) {
            data.forEach(result => {
                const resultDiv = document.createElement('div');
                resultDiv.innerHTML = `
                    <p>ID: ${result.id}</p>
                    <p>Nombre: ${result.nombre_cliente}</p>
                    <p>Teléfono: ${result.telefono}</p>
                    <p>Tipo de equipo: ${result.tipo_equipo}</p>
                    <!-- Agrega más campos según tus necesidades -->
                    <hr>
                `;
                searchResult.appendChild(resultDiv);
            });
        } else {
            searchResult.textContent = 'No se encontraron resultados.';
        }
    });
});

