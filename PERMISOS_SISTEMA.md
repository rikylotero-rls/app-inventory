# 🔐 Sistema de Permisos - Inventory App

## Descripción General

El sistema implementa un control de permisos basado en roles para garantizar que solo usuarios autorizados puedan ejecutar acciones específicas.

---

## 📋 Permisos por Rol

### 👨‍💼 Rol: ADMINISTRADOR

Los administradores tienen acceso completo a todas las funciones del panel de administración:

#### Permisos de Productos

- ✅ `ver_productos` - Visualizar lista de productos
- ✅ `editar_productos` - Modificar datos de productos
- ✅ `eliminar_productos` - Eliminar productos del inventario
- ✅ `crear_productos` - Crear nuevos productos

#### Permisos de Pedidos

- ✅ `ver_pedidos` - Visualizar todos los pedidos
- ✅ `editar_pedidos` - Modificar estado de pedidos
- ✅ `autorizar_pedidos` - Aprobar/confirmar pedidos
- ✅ `rechazar_pedidos` - Cancelar/rechazar pedidos

#### Permisos de Usuarios

- ✅ `ver_usuarios` - Listar usuarios del sistema
- ✅ `ver_categorias` - Visualizar categorías
- ✅ `editar_categorias` - Modificar categorías

#### Permisos de Reportes

- ✅ `ver_reportes` - Acceder a reportes y estadísticas
- ✅ `ver_configuracion` - Acceder a configuración del sistema

---

### 👤 Rol: CLIENTE

Los clientes tienen permisos limitados para usar la tienda:

#### Permisos de Productos

- ✅ `ver_productos` - Visualizar productos disponibles

#### Permisos de Carrito

- ✅ `ver_carrito` - Acceder al carrito de compras
- ✅ `crear_pedidos` - Crear nuevos pedidos

#### Permisos de Seguimiento

- ✅ `ver_pedidos_propios` - Ver sus propios pedidos
- ✅ `ver_seguimiento` - Rastrear estado de pedidos

---

## 🔄 Flujo de Autenticación

### Login de Administrador

```javascript
// Login → Validación de rol ADMIN → Asignación de permisos completos → Redirección a admin.html
```

### Login de Cliente

```javascript
// Login → Validación de rol CLIENTE → Asignación de permisos básicos → Redirección a index.html
```

### Registro de Cliente

```javascript
// Registro → Auto-login automático → Asignación de permisos de cliente → Redirección a index.html
```

---

## 🛡️ Validaciones Implementadas

### En Frontend (auth.js)

**Login Admin:**

```javascript
if (data.user && (data.user.rol === "ADMIN" || data.user.rol === "admin")) {
  // Asignar permisos de administrador completos
  localStorage.setItem("admin-token", data.access_token);
  localStorage.setItem("admin-usuario", JSON.stringify(usuarioAdmin));
}
```

**Login Cliente:**

```javascript
// Asignar permisos básicos de cliente
localStorage.setItem("usuario", JSON.stringify(usuarioCliente));
```

---

## 🎯 Validaciones en Cada Acción

### Admin Panel (admin.js)

#### Ver Productos

```javascript
if (!validarPermisosAdmin("ver_productos")) {
  console.warn("❌ Permisos insuficientes");
  return [];
}
```

#### Editar Producto

```javascript
if (!validarPermisosAdmin("editar_productos")) {
  mostrarMensajeAdmin("❌ No tienes permisos para editar productos", "error");
  return;
}
```

#### Eliminar Producto

```javascript
if (!validarPermisosAdmin("eliminar_productos")) {
  mostrarMensajeAdmin("❌ No tienes permisos para eliminar productos", "error");
  return;
}
```

#### Autorizar Pedidos

```javascript
if (!validarPermisosAdmin("autorizar_pedidos")) {
  mostrarMensajeAdmin("❌ No tienes permisos para autorizar pedidos", "error");
  return;
}
```

#### Cambiar Estado de Pedido

```javascript
if (!validarPermisosAdmin("editar_pedidos")) {
  mostrarMensajeAdmin("❌ No tienes permisos para modificar pedidos", "error");
  return;
}
```

### E-commerce (app.js)

#### Agregar al Carrito

```javascript
if (!validarPermisosCliente("ver_carrito")) {
  mostrarNotificacion("❌ Debes iniciar sesión para agregar productos");
  window.location.href = "login.html";
  return;
}
```

#### Crear Pedido

```javascript
if (!validarPermisosCliente("crear_pedidos")) {
  mostrarNotificacion("❌ No tienes permisos para crear pedidos");
  return;
}
```

---

## 📦 Estructura de Datos en localStorage

### Usuario Admin

```json
{
  "id": "user_id",
  "nombre": "Administrador",
  "email": "admin@inventory.com",
  "rol": "ADMIN",
  "access_token": "jwt_token",
  "permisos": {
    "ver_productos": true,
    "editar_productos": true,
    "eliminar_productos": true,
    "crear_productos": true,
    "ver_pedidos": true,
    "editar_pedidos": true,
    "autorizar_pedidos": true,
    "rechazar_pedidos": true,
    "ver_usuarios": true,
    "ver_categorias": true,
    "editar_categorias": true,
    "ver_reportes": true,
    "ver_configuracion": true
  }
}
```

### Usuario Cliente

```json
{
  "id": "user_id",
  "nombre": "Cliente Nombre",
  "email": "cliente@email.com",
  "rol": "CLIENTE",
  "access_token": "jwt_token",
  "permisos": {
    "ver_productos": true,
    "ver_carrito": true,
    "crear_pedidos": true,
    "ver_pedidos_propios": true,
    "ver_seguimiento": true
  }
}
```

---

## ⚙️ Funciones Clave de Validación

### En admin.js

```javascript
function validarPermisosAdmin(permisoRequerido) {
  const adminUsuario = JSON.parse(
    localStorage.getItem("admin-usuario") || "{}",
  );
  return adminUsuario.permisos && adminUsuario.permisos[permisoRequerido];
}
```

### En app.js

```javascript
function validarPermisosCliente(permisoRequerido) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  return usuario.permisos && usuario.permisos[permisoRequerido];
}
```

---

## 🔐 Credenciales de Prueba

### Admin

- **Email:** `admin@inventory.com`
- **Contraseña:** `admin123`
- **Permisos:** Todos los permisos completos

### Cliente

- **Email:** `cliente@inventory.com`
- **Contraseña:** `cliente123`
- **Permisos:** Permisos básicos de cliente

### Registro Nuevo

- Crear una nueva cuenta en la página de registro
- Se asignará automáticamente rol de CLIENTE
- Se otorgarán permisos básicos

---

## 🚀 Cómo Funcionan los Permisos

1. **Usuario inicia sesión** → Se valida en el backend
2. **Backend retorna rol** → ADMIN o CLIENTE
3. **Frontend asigna permisos** → Según el rol
4. **localStorage almacena** → Usuario + permisos
5. **Cada acción valida** → Verifica permiso antes de ejecutar
6. **Si no hay permiso** → Muestra error y previene acción

---

## 📝 Logs de Validación

Cuando falta un permiso, se registran mensajes descriptivos:

- **Admin:** `❌ No tienes permisos para [acción]`
- **Cliente:** `❌ Debes iniciar sesión` o `❌ No tienes permisos para [acción]`

---

## 🔄 Sincronización con Backend

Los permisos se asignan en el frontend basándose en el rol retornado por el backend.
El backend debe garantizar que solo usuarios con rol ADMIN tengan acceso a endpoints protegidos.

**Endpoints protegidos:**

- `PATCH /api/v1/orders/:id/status` - Requiere rol ADMIN
- `DELETE /api/v1/products/:id` - Requiere rol ADMIN
- `PUT /api/v1/products/:id` - Requiere rol ADMIN
- `POST /api/v1/orders` - Requiere autenticación

---

## ✅ Resumen de Implementación

✅ Sistema de permisos completo implementado
✅ Validaciones en frontend (admin.js y app.js)
✅ localStorage almacena permisos por usuario
✅ Mensajes de error descriptivos
✅ Protección de acciones críticas
✅ Flujo de autenticación seguro
✅ Sincronización con IDs de productos (1-59)
