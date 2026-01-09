const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultados');
const carritoContainer = document.getElementById('carrito-container');
const cartBody = document.getElementById('cart-body');
const totalPrecioSpan = document.getElementById('total-precio');

let productos = [];
let carrito = [];

// Lista de Tallas Definida
const TALLAS = ['0', '2', '4', '6', '8', '10', '12', '14', '16', 'S', 'M', 'L', 'XL', 'Única'];

// 1. Cargar Datos (Modificado con LocalStorage)
// Primero intentamos leer del navegador
const productosGuardados = localStorage.getItem('productos_tienda_luisino');

if (productosGuardados) {
    // Si existen datos guardados, los usamos
    productos = JSON.parse(productosGuardados);
    console.log("Cargado desde memoria local");
} else {
    // Si es la primera vez, cargamos del JSON original
    fetch('../assets/json/productos.json')
        .then(res => res.json())
        .then(data => {
            productos = data;
            // Opcional: Guardamos inmediatamente para tener la base lista
            localStorage.setItem('productos_tienda_luisino', JSON.stringify(productos));
        });
}
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

// 3. Mostrar Tarjetas con Controles (VERSIÓN MEJORADA CON EDICIÓN)
function mostrarResultados(lista) {
    resultsContainer.innerHTML = '';
    
    if (lista.length === 0) {
        resultsContainer.innerHTML = '<p style="color:white; text-align:center;">No se encontraron productos.</p>';
        return;
    }

    lista.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        resultsContainer.appendChild(card); // Agregamos la tarjeta al contenedor primero

        // Creamos una función interna para dibujar el contenido de ESTA tarjeta específica.
        // Esto nos permite redibujarla cuando guardemos el precio sin recargar toda la lista.
        const renderCardContent = (isEditing) => {
            if (isEditing) {
                // --- MODO EDICIÓN ---
                card.innerHTML = `
                    <div class="card-header">
                        <h3>Editando: ${p.producto}</h3>
                    </div>
                    <div class="edit-controls" style="padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                        <div style="margin-bottom:10px;">
                            <label style="display:block; font-size: 0.9rem; margin-bottom: 5px;">Precio Unidad (S/):</label>
                            <input type="number" id="edit-min-${index}" value="${p.precio_minorista}" style="width:100%; padding:5px; border-radius:4px; border:none;">
                        </div>
                        <div style="margin-bottom:15px;">
                            <label style="display:block; font-size: 0.9rem; margin-bottom: 5px;">Precio Mayorista (x unidad):</label>
                            <input type="number" id="edit-may-${index}" value="${p.precio_mayorista}" style="width:100%; padding:5px; border-radius:4px; border:none;">
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button class="btn-save" style="background:#2ecc71; color:white; padding:8px; border:none; cursor:pointer; flex:1; border-radius:4px; font-weight:bold;">Guardar</button>
                            <button class="btn-cancel" style="background:#e74c3c; color:white; padding:8px; border:none; cursor:pointer; flex:1; border-radius:4px; font-weight:bold;">Cancelar</button>
                        </div>
                    </div>
                `;
                
                // Lógica de los botones Guardar y Cancelar
                card.querySelector('.btn-save').onclick = () => {
                    const nuevoMin = parseFloat(document.getElementById(`edit-min-${index}`).value);
                    const nuevoMay = parseFloat(document.getElementById(`edit-may-${index}`).value);
                    
                    if(nuevoMin >= 0 && nuevoMay >= 0) {
                        // 1. Actualizamos el objeto en memoria RAM
                        p.precio_minorista = nuevoMin;
                        p.precio_mayorista = nuevoMay;

                        // 2. [NUEVO] Guardamos permanentemente en el navegador
                        localStorage.setItem('productos_tienda_luisino', JSON.stringify(productos));
                        alert("¡Precio actualizado y guardado!"); // Feedback visual opcional

                        renderCardContent(false); 
                    } else {
                        alert("Por favor ingresa precios válidos.");
                    }
                };
                
                card.querySelector('.btn-cancel').onclick = () => {
                    renderCardContent(false); // Simplemente volvemos sin guardar
                };

            } else {
                // --- MODO VISTA NORMAL ---
                let opcionesTalla = TALLAS.map(t => `<option value="${t}">${t}</option>`).join('');
                
                // Nota el botón del lápiz (✏️) añadido en el header
                card.innerHTML = `
                    <div class="card-header" style="display:flex; justify-content:space-between; align-items:start;">
                        <div style="flex:1;">
                            <h3>${p.producto}</h3>
                            <div class="card-info">${p.marca} - ${p.modelo || ''}</div>
                        </div>
                        <button class="btn-edit-mode" title="Editar Precio" style="background:none; border:none; cursor:pointer; font-size:1.2rem; margin-left:10px;">✏️</button>
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
                                <option value="docena">Docena (S/ ${(p.precio_mayorista * 12).toFixed(2)})</option>
                            </select>
                        </div>

                        <div class="control-group" style="grid-column: span 2;">
                            <label>Cantidad:</label>
                            <input type="number" id="cantidad-${index}" value="1" min="1">
                        </div>
                        
                        <div class="price-tag">
                            Mayorista (x unidad): S/ ${p.precio_mayorista}
                        </div>

                        <button class="btn-add">
                            + Agregar a la Lista
                        </button>
                    </div>
                `;

                // Asignamos los eventos click
                const btnAdd = card.querySelector('.btn-add');
                btnAdd.onclick = () => agregarItem(p, index); 
                
                const btnEdit = card.querySelector('.btn-edit-mode');
                btnEdit.onclick = () => renderCardContent(true); // Activa el modo edición
            }
        };

        // Inicializamos la tarjeta en modo vista (false)
        renderCardContent(false);
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
    window.location.href = "../index.html";
}

// ... todo tu código anterior ...

// 7. Restaurar Precios (Reset de Fábrica)
function restaurarPreciosOriginales() {
    if(confirm("⚠ ¿Estás seguro? \n\nEsto borrará TODOS los precios personalizados y volverá a los originales del sistema.")) {
        localStorage.removeItem('productos_tienda_luisino');
        location.reload(); // Recarga la página para traer el JSON limpio
    }
}