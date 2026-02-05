# API Documentation - Inventory System

Base URL: `http://localhost:3000/api/v1`

---

## 🔐 Autenticación

### Registro

```http
POST /auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Seguro123!",
  "telefono": "+57 315 5508228"
}
```

**Response (201 Created):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-aqui",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "CLIENTE"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@inventory.com",
  "password": "Admin123!"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-aqui",
    "nombre": "Admin",
    "email": "admin@inventory.com",
    "rol": "ADMIN"
  }
}
```

---

## 📦 Productos

Todos los precios están en **centavos COP**. Ejemplo: `2250000` = $22.500 COP

### Listar productos

```http
GET /products?page=1&limit=20&search=papas
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters:**

- `page` (default: 1) - Número de página
- `limit` (default: 20) - Items por página
- `search` (optional) - Buscar por nombre o descripción

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "prod-1",
      "nombre": "Papas Clásicas 50g",
      "descripcion": "Papas fritas crujientes",
      "precio": 2250000,
      "stock": 150,
      "imagen": "https://...",
      "categoria": {
        "id": "cat-1",
        "nombre": "Snacks"
      },
      "activo": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 70,
    "page": 1,
    "limit": 20,
    "pages": 4
  }
}
```

### Obtener producto por ID

```http
GET /products/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200 OK):**

```json
{
  "id": "prod-1",
  "nombre": "Papas Clásicas 50g",
  "descripcion": "Papas fritas crujientes",
  "precio": 2250000,
  "stock": 150,
  "imagen": "https://...",
  "categoria": {
    "id": "cat-1",
    "nombre": "Snacks"
  },
  "activo": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Listar productos por categoría

```http
GET /products/category/:categoriaId?page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "prod-1",
      "nombre": "Papas Clásicas 50g",
      "precio": 2250000,
      "stock": 150,
      "imagen": "https://..."
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### Crear producto (ADMIN ONLY)

```http
POST /products
Content-Type: application/json
Authorization: Bearer ADMIN_ACCESS_TOKEN

{
  "nombre": "Nuevo Producto",
  "descripcion": "Descripción del producto",
  "precio": 5000000,
  "stock": 50,
  "categoriaId": "cat-1",
  "imagen": "https://..."
}
```

**Response (201 Created):**

```json
{
  "id": "prod-new-1",
  "nombre": "Nuevo Producto",
  "descripcion": "Descripción del producto",
  "precio": 5000000,
  "stock": 50,
  "categoriaId": "cat-1",
  "imagen": "https://...",
  "activo": true,
  "createdAt": "2024-01-16T10:30:00Z",
  "updatedAt": "2024-01-16T10:30:00Z"
}
```

### Actualizar producto (ADMIN ONLY)

```http
PUT /products/:id
Content-Type: application/json
Authorization: Bearer ADMIN_ACCESS_TOKEN

{
  "nombre": "Nombre actualizado",
  "precio": 5500000,
  "stock": 60
}
```

### Eliminar producto (ADMIN ONLY)

```http
DELETE /products/:id
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

**Response (200 OK):**

```json
{
  "message": "Producto eliminado exitosamente"
}
```

---

## 🏷️ Categorías

### Listar categorías

```http
GET /categories
```

**Response (200 OK):**

```json
[
  {
    "id": "cat-1",
    "nombre": "Snacks",
    "descripcion": "Productos para picar",
    "icono": "🍟",
    "_count": {
      "products": 20
    }
  }
]
```

### Obtener categoría con sus productos

```http
GET /categories/:id
```

**Response (200 OK):**

```json
{
  "id": "cat-1",
  "nombre": "Snacks",
  "descripcion": "Productos para picar",
  "icono": "🍟",
  "products": [
    {
      "id": "prod-1",
      "nombre": "Papas Clásicas 50g",
      "precio": 2250000,
      "stock": 150,
      "imagen": "https://..."
    }
  ],
  "_count": {
    "products": 20
  }
}
```

### Crear categoría (ADMIN ONLY)

```http
POST /categories
Content-Type: application/json
Authorization: Bearer ADMIN_ACCESS_TOKEN

{
  "nombre": "Nueva Categoría",
  "descripcion": "Descripción",
  "icono": "🆕"
}
```

---

## 📋 Órdenes

### Crear orden

```http
POST /orders
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "items": [
    {
      "productoId": "prod-1",
      "cantidad": 2,
      "precioUnitario": 2250000
    },
    {
      "productoId": "prod-2",
      "cantidad": 1,
      "precioUnitario": 3500000
    }
  ],
  "notasEntrega": "Entregar en la puerta principal"
}
```

**Response (201 Created):**

```json
{
  "id": "order-1",
  "numero": "PED-1705322400000",
  "total": 8000000,
  "estado": "PENDIENTE",
  "notasEntrega": "Entregar en la puerta principal",
  "entregaEn": null,
  "usuario": {
    "id": "user-1",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "+57 315 5508228"
  },
  "items": [
    {
      "id": "item-1",
      "cantidad": 2,
      "precioUnitario": 2250000,
      "subtotal": 4500000,
      "producto": {
        "id": "prod-1",
        "nombre": "Papas Clásicas 50g",
        "imagen": "https://..."
      }
    },
    {
      "id": "item-2",
      "cantidad": 1,
      "precioUnitario": 3500000,
      "subtotal": 3500000,
      "producto": {
        "id": "prod-2",
        "nombre": "Gaseosa 2L",
        "imagen": "https://..."
      }
    }
  ],
  "createdAt": "2024-01-16T10:30:00Z",
  "updatedAt": "2024-01-16T10:30:00Z"
}
```

### Listar órdenes

```http
GET /orders
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Comportamiento:**

- Clientes: Ven solo sus órdenes
- Admins: Ven todas las órdenes

**Response (200 OK):**

```json
[
  {
    "id": "order-1",
    "numero": "PED-1705322400000",
    "total": 8000000,
    "estado": "PENDIENTE",
    "usuario": { ... },
    "items": [ ... ],
    "createdAt": "2024-01-16T10:30:00Z"
  }
]
```

### Obtener orden por ID

```http
GET /orders/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Actualizar estado (ADMIN ONLY)

```http
PATCH /orders/:id/status
Content-Type: application/json
Authorization: Bearer ADMIN_ACCESS_TOKEN

{
  "estado": "EN_PREPARACION",
  "notasEntrega": "Preparando pedido"
}
```

**Estados válidos:**

- `PENDIENTE` - Orden creada, pendiente de procesar
- `EN_PREPARACION` - Preparando el pedido
- `ENTREGADO` - Entregado (auto-asigna fecha)
- `CANCELADO` - Cancelado

### Cancelar orden

```http
PATCH /orders/:id/cancel
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Notas:**

- Clientes: Pueden cancelar sus propias órdenes (si no están entregadas)
- Admins: Pueden cancelar cualquier orden (si no está entregada)
- Al cancelar: Se restaura el stock automáticamente

---

## 👥 Usuarios

Todos los endpoints requieren autenticación JWT. Solo ADMIN puede gestionar usuarios.

### Listar usuarios (ADMIN ONLY)

```http
GET /users
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### Obtener usuario (ADMIN ONLY)

```http
GET /users/:id
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### Crear usuario (ADMIN ONLY)

```http
POST /users
Content-Type: application/json
Authorization: Bearer ADMIN_ACCESS_TOKEN

{
  "nombre": "Nuevo Usuario",
  "email": "nuevo@example.com",
  "password": "Seguro123!",
  "telefono": "+57 315 5508228",
  "rol": "CLIENTE"
}
```

### Actualizar usuario (ADMIN ONLY)

```http
PUT /users/:id
Content-Type: application/json
Authorization: Bearer ADMIN_ACCESS_TOKEN

{
  "nombre": "Nombre actualizado",
  "telefono": "+57 315 5508228",
  "rol": "CLIENTE"
}
```

### Desactivar usuario (ADMIN ONLY)

```http
DELETE /users/:id
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### Reactivar usuario (ADMIN ONLY)

```http
POST /users/:id/reactivate
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

---

## ❌ Códigos de Error

| Código | Significado  | Ejemplo                           |
| ------ | ------------ | --------------------------------- |
| 200    | OK           | Solicitud exitosa                 |
| 201    | Created      | Recurso creado                    |
| 400    | Bad Request  | Datos inválidos                   |
| 401    | Unauthorized | Token inválido o no proporcionado |
| 403    | Forbidden    | Permisos insuficientes            |
| 404    | Not Found    | Recurso no encontrado             |
| 409    | Conflict     | Email duplicado                   |
| 500    | Server Error | Error del servidor                |

**Ejemplo de error:**

```json
{
  "statusCode": 400,
  "message": "Stock insuficiente para el producto 'Papas Clásicas 50g'. Disponible: 5",
  "error": "Bad Request"
}
```

---

## 🔑 Headers Requeridos

Para endpoints protegidos:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 💡 Ejemplos con cURL

### Login y guardar token

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventory.com","password":"Admin123!"}' \
  | jq -r '.access_token')

echo $TOKEN
```

### Listar productos usando el token

```bash
curl -X GET "http://localhost:3000/api/v1/products?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Crear orden

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "productoId": "prod-1001",
        "cantidad": 2,
        "precioUnitario": 2250000
      }
    ],
    "notasEntrega": "Entregar en horario laboral"
  }'
```

---

## 📊 Información sobre Precios

- **Formato en Base de Datos**: Centavos COP (integer)
- **Ejemplo**: `2250000` representa $22.500 COP
- **Conversión**: Precio Visible ÷ 100 = Centavos
- **Ejemplo**: $22.500 COP ÷ 100 = `2250000` centavos

---

## 🔐 Seguridad

- ✅ Las contraseñas se hashean con bcrypt (10 salt rounds)
- ✅ Los tokens JWT expiran en 24 horas
- ✅ CORS está configurado para localhost
- ✅ Validación de DTOs en todas las entradas
- ✅ Control de acceso basado en roles (RBAC)

---

Última actualización: 2024-01-16
