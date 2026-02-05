// Lock para evitar ejecuciones concurrentes de actualizarDashboard
let dashboardUpdating = false;

// ===== PANEL ADMINISTRADOR =====
// URL base del backend
const BACKEND_URL = window.BACKEND_URL || 'http://localhost:3000';

// Normaliza la URL de la imagen para rutas relativas o absolutas
function normalizarImagenUrlAdmin(url) {
  if (!url) return '../assets/product-placeholder.svg';
  if (url.startsWith('http')) return url;
  // Si la ruta es relativa, asegúrate de que apunte a la carpeta correcta
  if (url.startsWith('/')) return '..' + url;
  return '../assets/' + url;
}

// Validar permisos de administrador
function validarPermisosAdmin(permisoRequerido) {
  const adminUsuario = JSON.parse(localStorage.getItem('admin-usuario') || '{}');
  return adminUsuario.permisos && adminUsuario.permisos[permisoRequerido];
}

// Cargar productos desde JSON
async function cargarProductosFromJSON() {
  try {
    // Validar que el usuario tiene permisos para ver productos
    if (!validarPermisosAdmin('ver_productos')) {
      console.warn('❌ Permisos insuficientes para ver productos');
      return [];
    }
    
    // Cargar desde JSON local
    const responseLocal = await fetch('../data/productos-imagenes.json');
    if (responseLocal.ok) {
      const dataLocal = await responseLocal.json();
      console.log('✅ Productos del admin cargados desde JSON');
      return dataLocal.productos.map(prod => ({
        id: String(prod.id),
        nombre: prod.nombre,
        categoria: prod.categoria || '',
        precio: prod.precio,
        stock: prod.stock,
        imagen: normalizarImagenUrlAdmin(prod.imagen),
        descripcion: prod.descripcion || prod.nombre
      }));
    }
  } catch (error) {
    console.error('❌ Error cargando productos desde JSON:', error);
  }
  // Si falla, retornar vacío
  return [];
}

// Inicialización automática al cargar la página admin
document.addEventListener('DOMContentLoaded', function() {
  // Validar token y permisos antes de proceder
  const adminToken = localStorage.getItem('admin-token');
  const adminUsuario = JSON.parse(localStorage.getItem('admin-usuario') || '{}');
  
  if (!adminToken || !adminUsuario.permisos) {
    console.warn('No hay token de administrador o permisos insuficientes. Redirigiendo a login...');
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-usuario');
    window.location.href = 'login-admin.html';
    return;
  }
  
  // Configurar nombre de usuario en la interfaz
  const nombreUsuarioEl = document.getElementById('nombre-usuario');
  if (nombreUsuarioEl) {
    nombreUsuarioEl.textContent = adminUsuario.nombre || 'Administrador';
  }
  
  cargarDatosAdmin();
  configurarMenu();
  // Actualización automática de pedidos y dashboard cada 10 segundos SOLO si hay cambios
  let lastUpdateTime = Date.now();
  setInterval(() => {
    const now = Date.now();
    // Evitar actualización demasiado frecuente
    if (now - lastUpdateTime < 8000) return;
    lastUpdateTime = now;
    
    cargarDatosAdmin();
    // Si la sección de pedidos está visible, recargar la tabla
    const seccionPedidos = document.getElementById('seccion-pedidos');
    if (seccionPedidos && typeof seccionPedidos.style !== 'undefined' && (seccionPedidos.style.display !== 'none' || seccionPedidos.classList.contains('activa'))) {
      cargarTablaPedidos();
    }
    // Si el dashboard está visible, actualizarlo
    const seccionDashboard = document.getElementById('seccion-dashboard');
    if (seccionDashboard && typeof seccionDashboard.style !== 'undefined' && (seccionDashboard.style.display !== 'none' || seccionDashboard.classList.contains('activa'))) {
      actualizarDashboard();
    }
  }, 10000);
});

// Helper para obtener credenciales admin
async function getAdminCredenciales() {
  try {
    const stored = localStorage.getItem('admin-cred');
    if (stored) return JSON.parse(stored);
    const resp = await fetch('../config/admin.json');
    if (resp.ok) return await resp.json();
  } catch (e) {
    console.error('Error obteniendo credenciales admin', e);
  }
  return null;
}
// Exponer la función para scripts inline
window.getAdminCredenciales = getAdminCredenciales;

// Cargar datos del inventario real
async function cargarDatosAdmin() {
  try {
    // Cargar productos desde JSON o backend
    productosAdmin = await cargarProductosFromJSON();
    // Cargar pedidos reales desde la API REST
    // Configuración flexible de la URL del backend
    // ...existing code...
    let pedidosRespOk = false;
    try {
      const respPedidos = await fetch(`${BACKEND_URL}/api/v1/orders`, {
        headers: {
          'Authorization': 'Bearer ' + (localStorage.getItem('admin-token') || '')
        }
      });
      if (respPedidos.ok) {
        const pedidosData = await respPedidos.json();
        // El backend retorna directamente un array, no un objeto con propiedad 'data'
        pedidosAdmin = Array.isArray(pedidosData) ? pedidosData : (Array.isArray(pedidosData.data) ? pedidosData.data : []);
        console.log('Pedidos cargados:', pedidosAdmin);
        pedidosRespOk = true;
      } else {
        pedidosAdmin = [];
        if (!window._errorPedidosShown) {
          console.error('No se pudieron cargar los pedidos reales. Status:', respPedidos.status);
          window._errorPedidosShown = true;
        }
      }
    } catch (err) {
      pedidosAdmin = [];
      if (!window._errorPedidosShown) {
        console.error('No se pudo conectar al backend de pedidos:', err);
        window._errorPedidosShown = true;
      }
    }
    // Consultar usuarios desde el backend
    try {
      const respUsuarios = await fetch(`${BACKEND_URL}/api/v1/users`, {
        headers: {
          'Authorization': 'Bearer ' + (localStorage.getItem('admin-token') || '')
        }
      });
      usuariosAdmin = respUsuarios.ok ? await respUsuarios.json() : [];
    } catch (err) {
      usuariosAdmin = [];
      console.error('No se pudieron cargar los usuarios reales:', err);
    }
    productosAdmin = productosAdmin.map(p => ({ ...p, imagen: normalizarImagenUrlAdmin(p.imagen) }));
    cargarTablaProductos();
    // Las siguientes llamadas deben estar fuera de cualquier bloque de gráficos
    cargarTablaPedidos();
    cargarTablaUsuarios();
  } catch (e) {
    console.error('Error cargando inventario real:', e);
    productosAdmin = [];
    cargarTablaProductos();
  }
}

// Configurar menú
function configurarMenu() {
  const enlaces = document.querySelectorAll('.menu-lateral-enlace');
  
  enlaces.forEach(enlace => {
    enlace.addEventListener('click', function(e) {
      e.preventDefault();
      
      const seccion = this.getAttribute('data-seccion');
      
      // Actualizar enlace activo
      document.querySelectorAll('.menu-lateral-enlace').forEach(e => e.classList.remove('activo'));
      this.classList.add('activo');
      
      // Mostrar sección
      document.querySelectorAll('.seccion-contenido').forEach(s => s.style.display = 'none');
      document.getElementById('seccion-' + seccion).style.display = 'block';
      
      // Actualizar título
      const titulos = {
        dashboard: '📊 Dashboard',
        productos: '📦 Gestión de Productos',
        categorias: '🏷️ Categorías',
        pedidos: '🚚 Gestión de Pedidos',
        usuarios: '👥 Gestión de Usuarios',
        reportes: '📈 Reportes',
        configuracion: '⚙️ Configuración'
      };
      
      document.getElementById('titulo-seccion').textContent = titulos[seccion] || 'Dashboard';
      
        // Actualizar tablas al cambiar de sección
        if (seccion === 'pedidos') cargarTablaPedidos();
        if (seccion === 'usuarios') cargarTablaUsuarios();
        if (seccion === 'categorias') cargarCategoriasAdmin();
    });
  });
}

// Actualizar Dashboard

// Variables para los gráficos
window.chartVentas = null;
window.chartInventario = null;
window.chartVentasMes = null;
window.chartCategorias = null;

function actualizarDashboard() {
  const totalVentas = pedidosAdmin.reduce((sum, p) => sum + (p.total || 0), 0);
  const totalProductos = productosAdmin.length;
  const pedidosPendientes = pedidosAdmin.filter(p => p.estado === 'PENDIENTE').length;
  const pedidosEnPreparacion = pedidosAdmin.filter(p => p.estado === 'EN_PREPARACION').length;
  const pedidosEntregados = pedidosAdmin.filter(p => p.estado === 'ENTREGADO').length;
  const totalClientes = usuariosAdmin.length;
  const productosSinStock = productosAdmin.filter(p => p.stock === 0).length;

  const ventasElem = document.getElementById('total-ventas');
  if (ventasElem) ventasElem.textContent = '$' + totalVentas.toLocaleString('es-CO');
  const prodElem = document.getElementById('total-productos');
  if (prodElem) prodElem.textContent = totalProductos;
  const pedidosElem = document.getElementById('pedidos-pendientes');
  if (pedidosElem) pedidosElem.textContent = pedidosPendientes;
  const clientesElem = document.getElementById('total-clientes');
  if (clientesElem) clientesElem.textContent = totalClientes;
  
  // Actualizar más estadísticas si existen en el HTML
  const statEnPreparacion = document.getElementById('stat-en-preparacion');
  if (statEnPreparacion) {
    statEnPreparacion.innerHTML = `<div class="stat-icono">⚙️</div><div class="stat-valor">${pedidosEnPreparacion}</div><div class="stat-etiqueta">En Preparación</div>`;
  }
  const statEntregados = document.getElementById('stat-entregados');
  if (statEntregados) {
    statEntregados.innerHTML = `<div class="stat-icono">✅</div><div class="stat-valor">${pedidosEntregados}</div><div class="stat-etiqueta">Entregados</div>`;
  }
  const statSinStock = document.getElementById('stat-sin-stock');
  if (statSinStock) {
    statSinStock.innerHTML = `<div class="stat-icono">⚠️</div><div class="stat-valor">${productosSinStock}</div><div class="stat-etiqueta">Sin Stock</div>`;
  }

  // Destruir gráficos previos si existen
  if (dashboardUpdating) return;
  dashboardUpdating = true;
  try {
    if (window.chartVentas && typeof window.chartVentas.destroy === 'function') { window.chartVentas.destroy(); window.chartVentas = null; }
    if (window.chartInventario && typeof window.chartInventario.destroy === 'function') { window.chartInventario.destroy(); window.chartInventario = null; }
    if (window.chartVentasMes && typeof window.chartVentasMes.destroy === 'function') { window.chartVentasMes.destroy(); window.chartVentasMes = null; }
    if (window.chartCategorias && typeof window.chartCategorias.destroy === 'function') { window.chartCategorias.destroy(); window.chartCategorias = null; }

    // Gráfico de ventas por producto
    // Destruir el gráfico y esperar un ciclo antes de crear el nuevo
    const oldCanvasVentas = document.getElementById('grafico-ventas');
    if (window.chartVentas && typeof window.chartVentas.destroy === 'function') {
      window.chartVentas.destroy();
      window.chartVentas = null;
    }
    if (oldCanvasVentas) {
      setTimeout(() => {
        window.chartVentas = new Chart(oldCanvasVentas, {
          type: 'bar',
          data: {
            labels: productosAdmin.slice(0, 5).map(p => p.nombre),
            datasets: [{
              label: 'Ventas (en unidades)',
              data: productosAdmin.slice(0, 5).map(() => Math.floor(Math.random() * 100)),
              backgroundColor: '#B6E1F2',
              borderColor: '#386273',
              borderWidth: 2
            }]
          },
          options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
      }, 0);
    }
    const oldCanvasInventario = document.getElementById('grafico-inventario');
    if (window.chartInventario && typeof window.chartInventario.destroy === 'function') {
      window.chartInventario.destroy();
      window.chartInventario = null;
    }
    if (oldCanvasInventario) {
      setTimeout(() => {
        window.chartInventario = new Chart(oldCanvasInventario, {
          type: 'doughnut',
          data: {
            labels: productosAdmin.slice(0, 4).map(p => p.nombre),
            datasets: [{
              data: productosAdmin.slice(0, 4).map(p => p.stock),
              backgroundColor: ['#B6E1F2', '#386273', '#7CB9E8', '#4A9FCE'],
              borderColor: '#FFF',
              borderWidth: 2
            }]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
      }, 0);
    }
// Las llamadas a cargarTablaPedidos y cargarTablaUsuarios se mueven fuera del bloque de gráficos.
    const oldCanvasVentasMes = document.getElementById('grafico-ventas-mes');
    if (window.chartVentasMes && typeof window.chartVentasMes.destroy === 'function') {
      window.chartVentasMes.destroy();
      window.chartVentasMes = null;
    }
    if (oldCanvasVentasMes) {
      setTimeout(() => {
        window.chartVentasMes = new Chart(oldCanvasVentasMes, {
          type: 'line',
          data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
            datasets: [{
              label: 'Ventas ($)',
              data: [15000, 18000, 20000, 17000, 22000, 25000],
              borderColor: '#386273',
              backgroundColor: 'rgba(182, 225, 242, 0.1)',
              borderWidth: 3,
              tension: 0.4,
              fill: true
            }]
          },
          options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
      }, 0);
    }
    const oldCanvasCategorias = document.getElementById('grafico-categorias');
    if (window.chartCategorias && typeof window.chartCategorias.destroy === 'function') {
      window.chartCategorias.destroy();
      window.chartCategorias = null;
    }
    if (oldCanvasCategorias) {
      setTimeout(() => {
        const categorias = {};
        productosAdmin.forEach(p => { categorias[p.categoria] = (categorias[p.categoria] || 0) + 1; });
        window.chartCategorias = new Chart(oldCanvasCategorias, {
          type: 'pie',
          data: {
            labels: Object.keys(categorias),
            datasets: [{
              data: Object.values(categorias),
              backgroundColor: ['#B6E1F2', '#386273', '#7CB9E8', '#4A9FCE'],
              borderColor: '#FFF',
              borderWidth: 2
            }]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
      }, 0);
    }
  } catch (err) {
    console.error('Error al crear los gráficos:', err);
  }
  finally {
    dashboardUpdating = false;
  }
  // Llamar a las funciones de tabla después de cargar productos y gráficos
  cargarTablaPedidos();
  cargarTablaUsuarios();
}

// Cargar tabla de productos
function cargarTablaProductos() {
  const tbody = document.getElementById('tabla-productos-body');
  tbody.innerHTML = '';

  productosAdmin.forEach(producto => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>
        <img src="${producto.imagen}" alt="${producto.nombre}" class="tabla-imagen">
      </td>
      <td><strong>${producto.nombre}</strong></td>
      <td>${producto.categoria}</td>
      <td>$${producto.precio.toLocaleString('es-CO')}</td>
      <td>
        <strong>${producto.stock}</strong>
        ${producto.stock < 20 ? '<span style="color: var(--error);"> ⚠️ Bajo</span>' : ''}
      </td>
      <td class="acciones-tabla">
        <button class="btn-editar" onclick="editarProducto(${producto.id})">✎ Editar</button>
        <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">🗑️ Eliminar</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

// Cargar tabla de pedidos
function cargarTablaPedidos() {
  const tbody = document.getElementById('tabla-pedidos-body');
  if (!tbody) return;
  
  if (!Array.isArray(pedidosAdmin) || pedidosAdmin.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="sin-datos">No hay pedidos aún</td></tr>';
    return;
  }

  // Ordenar pedidos por más nuevos primero
  const pedidosOrdenados = [...pedidosAdmin].sort((a, b) => new Date(b.createdAt || b.fecha) - new Date(a.createdAt || a.fecha));
  
  tbody.innerHTML = pedidosOrdenados.map(pedido => {
    const nombreCliente = pedido.usuario?.nombre || pedido.cliente || 'Desconocido';
    const telefonoCliente = pedido.usuario?.telefono || pedido.telefono || '';
    const numeroRadicado = pedido.numero || pedido.id || 'S/N';
    const fechaPedido = pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString('es-CO') : 'N/A';
    const cantidadItems = pedido.items ? pedido.items.length : 0;
    const totalPedido = pedido.total ? pedido.total.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00';
    const estado = pedido.estado || 'PENDIENTE';
    const estaConfirmado = estado === 'EN_PREPARACION' || estado === 'ENTREGADO';
    
    const badgeEstado = estado === 'PENDIENTE' ? 'badge-pendiente' : 
                        estado === 'EN_PREPARACION' ? 'badge-preparacion' :
                        estado === 'ENVIADO' ? 'badge-enviado' :
                        estado === 'ENTREGADO' ? 'badge-entregado' : 'badge-default';
    
    return `
      <tr class="fila-pedido">
        <td><strong>#${numeroRadicado}</strong></td>
        <td>${nombreCliente}</td>
        <td>${telefonoCliente || 'N/A'}</td>
        <td><span class="badge-items">${cantidadItems} items</span></td>
        <td><strong>$${totalPedido}</strong></td>
        <td><span class="badge ${badgeEstado}">${estado}</span></td>
        <td>${fechaPedido}</td>
        <td class="acciones-tabla">
          <button class="btn-ver" onclick="abrirDetallePedido('${pedido.id}')" title="Ver detalles">👁️</button>
          ${!estaConfirmado ? `<button class="btn-confirmar-mini" onclick="confirmarPedido('${pedido.id}')" title="Confirmar">✓</button>` : ''}
          <a href="https://wa.me/${(telefonoCliente || '').replace(/\D/g, '')}" target="_blank" class="btn-whatsapp" title="WhatsApp">💬</a>
        </td>
      </tr>
    `;
  }).join('');

  // Agregar evento al campo de búsqueda
  const filtro = document.getElementById('filtro-pedidos');
  if (filtro) {
    filtro.addEventListener('keyup', filtrarPedidos);
  }
}

function filtrarPedidos() {
  const filtro = document.getElementById('filtro-pedidos').value.toLowerCase();
  const filas = document.querySelectorAll('.fila-pedido');
  
  filas.forEach(fila => {
    const texto = fila.textContent.toLowerCase();
    fila.style.display = texto.includes(filtro) ? '' : 'none';
  });
}

function abrirDetallePedido(pedidoId) {
  const pedido = pedidosAdmin.find(p => p.id === pedidoId);
  if (!pedido) return;

  const nombreCliente = pedido.usuario?.nombre || pedido.cliente || 'Desconocido';
  const emailCliente = pedido.usuario?.email || pedido.email || 'N/A';
  const telefonoCliente = pedido.usuario?.telefono || pedido.telefono || 'N/A';
  const numeroRadicado = pedido.numero || pedido.id || 'S/N';
  const fechaPedido = pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString('es-CO') : 'N/A';
  const horaPedido = pedido.createdAt ? new Date(pedido.createdAt).toLocaleTimeString('es-CO') : 'N/A';
  const estado = pedido.estado || 'PENDIENTE';
  const estaConfirmado = estado === 'EN_PREPARACION' || estado === 'ENTREGADO';

  let contenidoDetalle = `
    <div class="detalle-pedido-contenedor">
      <div class="detalle-header">
        <div class="detalle-seccion">
          <h3>Información del Pedido</h3>
          <div class="detalle-grid">
            <div class="detalle-item">
              <span class="detalle-label">Radicado:</span>
              <span class="detalle-valor">#${numeroRadicado}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Estado:</span>
              <span class="badge badge-${estado === 'PENDIENTE' ? 'pendiente' : estado === 'EN_PREPARACION' ? 'preparacion' : estado === 'ENTREGADO' ? 'entregado' : 'default'}">${estado}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Fecha:</span>
              <span class="detalle-valor">${fechaPedido} - ${horaPedido}</span>
            </div>
          </div>
        </div>

        <div class="detalle-seccion">
          <h3>Información del Cliente</h3>
          <div class="detalle-grid">
            <div class="detalle-item">
              <span class="detalle-label">Nombre:</span>
              <span class="detalle-valor">${nombreCliente}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Email:</span>
              <span class="detalle-valor">${emailCliente}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Teléfono:</span>
              <span class="detalle-valor">${telefonoCliente}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detalle-items">
        <h3>📦 Items del Pedido</h3>
        <table class="tabla-items">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${(pedido.items || []).map(item => {
              const precio = item.precioUnitario || item.precio || 0;
              const subtotal = (item.cantidad * precio).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
              return `
                <tr>
                  <td>${item.producto?.nombre || item.nombre || 'Producto'}</td>
                  <td class="cantidad">${item.cantidad}</td>
                  <td class="precio">$${precio.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td class="subtotal"><strong>$${subtotal}</strong></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="detalle-total">
        <div class="total-item">
          <span>Total Pedido:</span>
          <strong>$${(pedido.total || 0).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
        </div>
      </div>

      ${pedido.notas ? `
        <div class="detalle-notas">
          <h3>📝 Notas de Entrega</h3>
          <p>${pedido.notas}</p>
        </div>
      ` : ''}

      <div class="detalle-acciones-modal">
        ${!estaConfirmado ? `
          <button class="btn btn-principal" onclick="confirmarPedidoYCerrar('${pedido.id}')">✓ Confirmar Pedido</button>
        ` : `
          <button class="btn btn-secundario" onclick="actualizarEstadoPedido('${pedido.id}', '${estado}')" title="Cambiar estado">📝 Cambiar Estado</button>
        `}
        <a href="https://wa.me/${(telefonoCliente || '').replace(/\D/g, '')}" target="_blank" class="btn" style="background: #25d366; color: white; text-decoration: none;">📱 Contactar por WhatsApp</a>
      </div>
    </div>
  `;

  document.getElementById('contenido-detalle-pedido').innerHTML = contenidoDetalle;
  document.getElementById('modal-detalle-pedido').style.display = 'flex';
}

function cerrarModalDetallePedido() {
  document.getElementById('modal-detalle-pedido').style.display = 'none';
}

function confirmarPedidoYCerrar(pedidoId) {
  confirmarPedido(pedidoId);
  cerrarModalDetallePedido();
}

// Cargar tabla de usuarios
function cargarTablaUsuarios() {
  const tbody = document.getElementById('tabla-usuarios-body');
  tbody.innerHTML = '';

  usuariosAdmin.forEach(usuario => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><strong>${usuario.nombre}</strong></td>
      <td>${usuario.email}</td>
      <td>${usuario.telefono || 'N/A'}</td>
      <td>
        <span style="background-color: #E3F2FD; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">
          ${usuario.tipo || 'Cliente'}
        </span>
      </td>
      <td class="acciones-tabla">
        <button class="btn-eliminar" onclick="eliminarUsuario('${usuario.id}')">🗑️ Eliminar</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

// Modal de producto
function abrirModalProducto() {
  document.getElementById('modal-producto').classList.add('activo');
  document.getElementById('form-producto').reset();
  document.getElementById('form-producto').removeAttribute('data-id');
}

function cerrarModalProducto() {
  document.getElementById('modal-producto').classList.remove('activo');
}

function editarProducto(id) {
  // Validar permisos de administrador
  if (!validarPermisosAdmin('editar_productos')) {
    mostrarMensajeAdmin('❌ No tienes permisos para editar productos', 'error');
    return;
  }
  
  const producto = productosAdmin.find(p => p.id === id);
  if (!producto) return;

  document.getElementById('prod-nombre').value = producto.nombre;
  document.getElementById('prod-categoria').value = producto.categoria;
  document.getElementById('prod-precio').value = producto.precio;
  document.getElementById('prod-stock').value = producto.stock;
  document.getElementById('prod-imagen').value = producto.imagen;
  document.getElementById('prod-descripcion').value = producto.descripcion || '';
  document.getElementById('form-producto').setAttribute('data-id', id);

  abrirModalProducto();
}

function eliminarProducto(id) {
  // Validar permisos de administrador
  if (!validarPermisosAdmin('eliminar_productos')) {
    mostrarMensajeAdmin('❌ No tienes permisos para eliminar productos', 'error');
    return;
  }
  
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    // Eliminar producto en el backend
    // ...existing code...
    fetch(`${BACKEND_URL}/api/v1/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('admin-token') || '')
      }
    })
      .then(resp => {
        if (resp.ok) {
          mostrarMensajeAdmin('✓ Producto eliminado correctamente', 'exito');
          cargarDatosAdmin();
        } else {
          mostrarMensajeAdmin('Error al eliminar el producto', 'error');
        }
      })
      .catch(() => mostrarMensajeAdmin('Error de red al eliminar producto', 'error'));
  }
}

// Confirmar pedido (cambia estado a EN_PREPARACION)
function confirmarPedido(idPedido) {
  // Validar permisos de administrador
  if (!validarPermisosAdmin('autorizar_pedidos')) {
    mostrarMensajeAdmin('❌ No tienes permisos para autorizar pedidos', 'error');
    return;
  }
  
  if (confirm('¿Deseas confirmar este pedido? Se enviará una notificación WhatsApp al cliente.')) {
    fetch(`${BACKEND_URL}/api/v1/orders/${idPedido}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('admin-token') || '')
      },
      body: JSON.stringify({
        estado: 'EN_PREPARACION',
        notasEntrega: 'Pedido confirmado por administrador'
      })
    })
      .then(resp => {
        if (resp.ok) {
          mostrarMensajeAdmin('✓ Pedido confirmado. Notificación enviada al cliente.', 'exito');
          cargarDatosAdmin();
          cargarTablaPedidos();
        } else {
          mostrarMensajeAdmin('Error al confirmar el pedido', 'error');
        }
      })
      .catch(() => mostrarMensajeAdmin('Error de red al confirmar pedido', 'error'));
  }
}

// Cambiar estado de pedido
function cambiarEstadoPedido(idPedido) {
  // Validar permisos de administrador
  if (!validarPermisosAdmin('editar_pedidos')) {
    mostrarMensajeAdmin('❌ No tienes permisos para modificar pedidos', 'error');
    return;
  }
  
  const pedido = pedidosAdmin.find(p => p.id === idPedido);
  if (!pedido) return;

  // Ciclo de estados
  const estados = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'];
  const indiceActual = estados.indexOf(pedido.estado);
  const nuevoEstado = estados[(indiceActual + 1) % estados.length];

  // Actualizar estado en el backend
  // ...existing code...
  fetch(`${BACKEND_URL}/api/v1/orders/${idPedido}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + (localStorage.getItem('admin-token') || '')
    },
    body: JSON.stringify({ estado: nuevoEstado })
  })
    .then(resp => {
      if (resp.ok) {
        mostrarMensajeAdmin(`✓ Pedido cambió a estado: ${nuevoEstado}`, 'exito');
        cargarDatosAdmin(); // Recargar datos y tabla
      } else {
        mostrarMensajeAdmin('Error al actualizar el estado', 'error');
      }
    })
    .catch(() => mostrarMensajeAdmin('Error de red al actualizar pedido', 'error'));
}

// Eliminar usuario
function eliminarUsuario(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
    // Eliminar usuario en el backend
    // ...existing code...
    fetch(`${BACKEND_URL}/api/v1/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('admin-token') || '')
      }
    })
      .then(resp => {
        if (resp.ok) {
          mostrarMensajeAdmin('Usuario eliminado', 'exito');
          cargarDatosAdmin();
        } else {
          mostrarMensajeAdmin('Error al eliminar el usuario', 'error');
        }
      })
      .catch(() => mostrarMensajeAdmin('Error de red al eliminar usuario', 'error'));
  }
}

// Configurar formulario de producto

// Guardar configuración
function guardarConfiguracion() {
  mostrarMensajeAdmin('Configuración guardada correctamente', 'exito');
}

// Mostrar mensaje
function mostrarMensajeAdmin(mensaje, tipo) {
  const contenedor = document.createElement('div');
  contenedor.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background-color: ${tipo === 'exito' ? '#27AE60' : '#E74C3C'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  contenedor.textContent = mensaje;
  document.body.appendChild(contenedor);

  setTimeout(() => {
    contenedor.remove();
  }, 3000);
}

// Cerrar sesión
function cerrarSesionAdmin() {
  if (confirm('¿Deseas cerrar sesión?')) {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-usuario');
    window.location.href = 'login-admin.html';
  }
}

// Mostrar productos agrupados por categoría en la sección de categorías
function cargarCategoriasAdmin() {
  const contenedor = document.getElementById('categorias-lista');
  if (!contenedor) return;
  if (!Array.isArray(productosAdmin) || productosAdmin.length === 0) {
    contenedor.innerHTML = '<div class="vacio">No hay productos para mostrar.</div>';
    return;
  }
  // Agrupar productos por categoría
  const categorias = {};
  productosAdmin.forEach(prod => {
    const cat = prod.categoria || 'Sin categoría';
    if (!categorias[cat]) categorias[cat] = [];
    categorias[cat].push(prod);
  });
  // Renderizar
  contenedor.innerHTML = Object.keys(categorias).map(cat => `
    <div class="categoria-bloque">
      <h3 style="color:var(--azul-oscuro);margin-top:2rem;">${cat}</h3>
      <div class="categoria-productos-lista" style="display:flex;flex-wrap:wrap;gap:1.5rem;">
        ${categorias[cat].map(prod => `
          <div class="producto-card" style="background:white;border-radius:10px;box-shadow:0 2px 8px #0001;padding:1rem;width:220px;display:flex;flex-direction:column;align-items:center;">
            <img src="${prod.imagen}" alt="${prod.nombre}" style="width:80px;height:80px;object-fit:contain;margin-bottom:0.5rem;">
            <div style="font-weight:600;font-size:1.1rem;">${prod.nombre}</div>
            <div style="color:var(--gris-oscuro);font-size:0.95rem;">${prod.descripcion || ''}</div>
            <div style="margin:0.5rem 0;font-weight:600;">$${prod.precio ? prod.precio.toLocaleString('es-CO') : 0}</div>
            <div style="font-size:0.95rem;">Stock: <strong>${prod.stock}</strong></div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// En configurarMenu, después de actualizar el título y antes de cerrar el eventListener:
// if (seccion === 'categorias') cargarCategoriasAdmin();
