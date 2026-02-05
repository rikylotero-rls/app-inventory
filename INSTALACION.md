# 🚀 GUÍA DE INSTALACIÓN Y USO - INVENTORY APP

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Node.js v14+ (opcional, si usarás el servidor Express)
- Python 3+ (opcional, para servidor HTTP simple)

---

## 🚀 OPCIÓN 1: SERVIDOR HTTP SIMPLE (SIN DEPENDENCIAS)

### Con Python 3

```bash
# Navega a la carpeta del proyecto
cd "inventory app"

# Inicia el servidor
python -m http.server 8000

# Abre en tu navegador
http://localhost:8000
```

### Con Node.js (usando http-server)

```bash
# Instala globalmente http-server
npm install -g http-server

# Navega a la carpeta
cd "inventory app"

# Inicia el servidor
http-server

# Abre en tu navegador (usualmente)
http://localhost:8080
```

---

## 🚀 OPCIÓN 2: SERVIDOR EXPRESS (RECOMENDADO PARA PRODUCCIÓN)

### Requisitos

- Node.js v14+
- npm o yarn

### Pasos

1. **Navega al directorio del proyecto:**

   ```bash
   cd "inventory app"
   ```

2. **Instala dependencias:**

   ```bash
   npm install
   ```

3. **Inicia el servidor:**

   ```bash
   npm start
   ```

   Para desarrollo (con auto-reload):

   ```bash
   npm run dev
   ```

4. **Abre en tu navegador:**
   ```
   http://localhost:3000
   ```

---

## 🎯 PRIMEROS PASOS

### 1️⃣ Explorar el E-commerce (Cliente)

1. Abre la aplicación en tu navegador
2. Haz clic en "Registrarse" o "Iniciar sesión"
3. Crea una cuenta o usa datos de prueba
4. Explora los productos por categorías
5. Agrega productos al carrito
6. Finaliza tu pedido

### 2️⃣ Acceder al Panel Administrador

1. En el navegador, ve a: `http://localhost:8000/public/html/login-admin.html`
2. Usa estas credenciales:
   - **Email:** `admin@inventory.com`
   - **Contraseña:** `admin123`
3. ¡Ya estás en el panel de administración!

---

## 👤 DATOS DE PRUEBA

### Administrador

```
Email: admin@inventory.com
Contraseña: admin123
```

### Cliente (Registro)

Puedes crear una cuenta con cualquier datos, solo respeta el formato:

- Email válido (ej: usuario@correo.com)
- Contraseña mínimo 6 caracteres
- Teléfono con formato válido

---

## 🗂️ ESTRUCTURA DEL PROYECTO

```
inventory app/
├── index.html                    # Redirección principal
├── package.json                  # Dependencias Node.js
├── README.md                     # Documentación principal
├── INSTALACION.md               # Este archivo
│
├── server/
│   └── server.js                # Servidor Express (opcional)
│
└── public/
    ├── html/
    │   ├── index.html           # E-commerce
    │   ├── login.html           # Login cliente
    │   ├── registro.html        # Registro cliente
    │   ├── confirmacion.html    # Confirmación de pedido
    │   ├── admin.html           # Dashboard admin
    │   └── login-admin.html     # Login admin
    │
    ├── css/
    │   ├── global.css           # Estilos globales
    │   ├── ecommerce.css        # Estilos e-commerce
    │   └── admin.css            # Estilos panel admin
    │
    ├── js/
    │   ├── app.js               # Lógica e-commerce
    │   ├── carrito.js           # Gestión carrito
    │   ├── auth.js              # Autenticación
    │   └── admin.js             # Lógica admin
    │
    └── assets/
        ├── logo.png             # Logo de la empresa
        └── images/              # Imágenes de productos
```

---

## 🎨 PERSONALIZACIÓN

### Cambiar Logo

1. Reemplaza el archivo `public/assets/logo.png` con tu logo
2. El logo debe ser transparente (PNG recomendado)
3. Se mostrará automáticamente en toda la aplicación

### Cambiar Colores Corporativos

Edita `public/css/global.css`:

```css
:root {
  --azul-claro: #b6e1f2; /* Cambiar este color */
  --azul-oscuro: #386273; /* Cambiar este color */
  --blanco: #ffffff;
  --gris-claro: #f5f5f5;
  --gris-oscuro: #666666;
}
```

### Agregar Productos

**Opción 1: Vía Panel Admin**

1. Login como administrador
2. Ir a "Productos"
3. Hacer clic en "+ Agregar Producto"
4. Completar el formulario

**Opción 2: Editar directamente**

1. Abre `public/js/app.js`
2. Busca el array `productos = [...]`
3. Agrega un nuevo objeto producto:

```javascript
{
  id: 13,
  nombre: 'Tu Producto',
  categoria: 'bebidas',
  precio: 2500,
  stock: 100,
   imagen: '/assets/product-placeholder.svg',
  descripcion: 'Descripción del producto'
}
```

### Cambiar Información de Contacto

Edita `public/html/index.html` en la sección `<footer>`:

```html
<p>📞 +506 2345-6789</p>
<p>📧 info@inventory.com</p>
<p>📍 San José, Costa Rica</p>
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema: "No se cargan los estilos"

**Solución:** Asegúrate de usar un servidor HTTP (no abras archivos directamente)

### Problema: "El carrito no guarda los datos"

**Solución:** Los datos se guardan en localStorage del navegador. Verifica que no tengas modo incógnito activado.

### Problema: "No puedo acceder al admin"

**Solución:** Verifica que uses las credenciales correctas:

- Email: `admin@inventory.com`
- Contraseña: `admin123`

### Problema: "Las imágenes no se muestran"

**Solución:** Las imágenes usan placeholders. En producción, reemplaza con URLs reales de tus productos.

### Problema: "Error al instalar dependencias"

```bash
# Intenta limpiar el caché de npm
npm cache clean --force

# Y vuelve a instalar
npm install
```

---

## 📱 PRUEBA RESPONSIVIDAD

### Cambiar tamaño de ventana

- **Desktop:** 1920x1080 o superior
- **Tablet:** 768x1024
- **Mobile:** 375x667

La aplicación es totalmente responsiva y se adapta a cualquier pantalla.

---

## 🔐 CONSIDERACIONES DE SEGURIDAD

⚠️ **Importante para producción:**

1. **Contraseñas:** Nunca guardes contraseñas en texto plano. Usa bcrypt o similar.
2. **Backend:** Implementa un servidor real (Node.js, PHP, Python, etc.)
3. **Autenticación:** Usa JWT o sesiones seguras
4. **HTTPS:** Siempre usa HTTPS en producción
5. **Validación:** Valida TODOS los datos en el backend
6. **CORS:** Configura CORS correctamente en producción

---

## 📊 INFORMACIÓN DEL SISTEMA

- **Lenguaje Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Librería de Gráficos:** Chart.js
- **Almacenamiento:** localStorage (cliente)
- **Servidor Opcional:** Express.js
- **Node version:** v14+

---

## 📝 NOTAS IMPORTANTES

✅ **Características actuales:**

- E-commerce completo funcional
- Panel administrativo operativo
- Sistema de autenticación (cliente)
- Carrito de compras
- Gráficos y reportes
- Diseño responsivo
- Todos los precios en Pesos Colombianos ($)

⚠️ **Limitaciones actuales:**

- Datos guardados en navegador (localStorage)
- Sin cifrado de datos
- Sin procesamiento de pagos real
- Sin envíos de email automáticos

---

## 🚀 PRÓXIMOS PASOS

1. Implementar backend con base de datos
2. Agregar pasarela de pagos (Stripe, PayPal)
3. Envío de emails transaccionales
4. Tracking de pedidos
5. Sistema de calificaciones/reviews
6. Integración con redes sociales

---

## 📞 SOPORTE

Si tienes preguntas o problemas:

1. Revisa el README.md principal
2. Verifica la estructura de carpetas
3. Abre la consola del navegador (F12) para ver errores
4. Revisa los comentarios en el código

---

**¡Listo! Ya puedes usar Inventory App** 🎉

Para más información, consulta el archivo README.md principal.
