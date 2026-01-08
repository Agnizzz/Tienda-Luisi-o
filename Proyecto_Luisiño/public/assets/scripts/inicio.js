const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultados');
const carritoContainer = document.getElementById('carrito-container');
const cartBody = document.getElementById('cart-body');
const totalPrecioSpan = document.getElementById('total-precio');

let productos = [];
let carrito = [];

// Lista de Tallas Definida
const TALLAS = ['0', '2', '4', '6', '8', '10', '12', '14', '16', 'S', 'M', 'L', 'XL', 'Única'];

// 1. Cargar Datos
fetch('assets/data/productos.json')
    .then(res => res.json())
    .then(data => productos = data);

// 2. Buscador
searchInput.addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase();
    if (termino.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    const filtrados = productos.filter(p => {
        const texto = (p.producto + ' ' + p.marca + ' ' + p.modelo).toLowerCase();
        return texto.includes(termino);
    });

    mostrarResultados(filtrados);
});

// 3. Mostrar Tarjetas con Controles
function mostrarResultados(lista) {
    resultsContainer.innerHTML = '';
    
    if (lista.length === 0) {
        resultsContainer.innerHTML = '<p style="color:white; text-align:center;">No se encontraron productos.</p>';
        return;
    }

    lista.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Creamos las opciones de talla HTML
        let opcionesTalla = TALLAS.map(t => `<option value="${t}">${t}</option>`).join('');

        card.innerHTML = `
            <div class="card-header">
                <h3>${p.producto}</h3>
                <div class="card-info">${p.marca} - ${p.modelo || ''}</div>
            </div>
            
            <div class="order-controls">
                <div class="control-group">
                    <label>Talla:</label>
                    <select id="talla-${index}">
                        ${opcionesTalla}
                    </select>
                </div>

                <div class="control-group">
                    <label>Tipo:</label>
                    <select id="tipo-${index}">
                        <option value="unidad">Unidad (S/ ${p.precio_minorista})</option>
                        <option value="docena">Docena (S/ ${p.precio_mayorista * 12})</option>
                    </select>
                </div>

                <div class="control-group" style="grid-column: span 2;">
                    <label>Cantidad:</label>
                    <input type="number" id="cantidad-${index}" value="1" min="1">
                </div>
                
                <div class="price-tag">
                    Mayorista (x unidad): S/ ${p.precio_mayorista}
                </div>

                <button class="btn-add" onclick="agregarAlCarrito(${index})">
                    + Agregar a la Lista
                </button>
            </div>
        `;
        // Guardamos el objeto producto completo en el elemento DOM para usarlo luego si es necesario
        // pero usaremos el índice del array filtrado no funcionará bien si filtramos de nuevo.
        // TRUCO: Pasamos el producto entero como JSON string al onclick, o mejor, usamos una variable global temporal.
        // Para simplificar, agregamos el botón con un listener directo en el código abajo:
        
        const btn = card.querySelector('.btn-add');
        btn.onclick = () => agregarItem(p, index);

        resultsContainer.appendChild(card);
    });
}

// 4. Lógica de Agregar al Carrito
function agregarItem(producto, idUnico) {
    const talla = document.getElementById(`talla-${idUnico}`).value;
    const tipo = document.getElementById(`tipo-${idUnico}`).value; // 'unidad' o 'docena'
    const cantidad = parseInt(document.getElementById(`cantidad-${idUnico}`).value);

    if (cantidad < 1) return alert("La cantidad debe ser mayor a 0");

    // Calcular Precio
    let precioUnitarioReal = 0;
    let subtotal = 0;
    let detalleTipo = "";

    if (tipo === 'unidad') {
        precioUnitarioReal = producto.precio_minorista;
        subtotal = precioUnitarioReal * cantidad;
        detalleTipo = "Unid.";
    } else {
        // Asumimos que precio_mayorista es precio POR PRENDA dentro de la docena
        // Si el excel dice 15, la docena cuesta 15 * 12 = 180.
        precioUnitarioReal = producto.precio_mayorista * 12; 
        subtotal = precioUnitarioReal * cantidad;
        detalleTipo = "Docena(s)";
    }

    // Crear objeto del pedido
    const itemPedido = {
        nombre: producto.producto,
        talla: talla,
        tipo: detalleTipo,
        cantidad: cantidad,
        subtotal: subtotal
    };

    carrito.push(itemPedido);
    renderizarCarrito();
    
    // Limpiar input visualmente (opcional)
    document.getElementById(`cantidad-${idUnico}`).value = 1;
}

// 5. Dibujar el Carrito
function renderizarCarrito() {
    if (carrito.length > 0) {
        carritoContainer.style.display = 'block';
    } else {
        carritoContainer.style.display = 'none';
    }

    cartBody.innerHTML = '';
    let totalGlobal = 0;

    carrito.forEach((item, i) => {
        totalGlobal += item.subtotal;
        
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.talla} (${item.tipo})</td>
            <td style="text-align:center;">${item.cantidad}</td>
            <td>S/ ${item.subtotal.toFixed(2)}</td>
            <td><button class="btn-delete" onclick="eliminarItem(${i})">X</button></td>
        `;
        cartBody.appendChild(fila);
    });

    totalPrecioSpan.innerText = `S/ ${totalGlobal.toFixed(2)}`;
}

// 6. Eliminar Item
function eliminarItem(index) {
    carrito.splice(index, 1);
    renderizarCarrito();
}

// 7. Copiar al Portapapeles (Para pegar en WhatsApp o Excel)
function copiarPedido() {
    let texto = "Hola, este es mi pedido:\n\n";
    let total = 0;
    
    carrito.forEach(item => {
        texto += `- ${item.cantidad} ${item.tipo} de ${item.nombre} (Talla: ${item.talla}) = S/ ${item.subtotal}\n`;
        total += item.subtotal;
    });
    
    texto += `\n*TOTAL: S/ ${total}*`;
    
    navigator.clipboard.writeText(texto).then(() => {
        alert("¡Pedido copiado! Ahora puedes pegarlo en WhatsApp.");
    });
}

function cerrarSesion() {
    // Aquí iría tu lógica real, por ejemplo:
    // window.location.href = 'login.html';
    alert("Cerrando sesión...");
    window.location.href = "login.html";
}