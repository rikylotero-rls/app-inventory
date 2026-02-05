# 🚀 QUICK REFERENCE - API Inventory

## 🌐 BASE URL

```
http://localhost:3000/api/v1
```

---

## 🔐 AUTHENTICATION

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "nombre": "Juan",
  "email": "juan@example.com",
  "password": "Pass123!",
  "telefono": "+573155508228"
}
```

**Returns:** `{ access_token, user }`

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@inventory.com",
  "password": "Admin123!"
}
```

**Returns:** `{ access_token, user }`

---

## 🛒 PRODUCTS

| Method | Endpoint                                 | Auth | Role  | Description               |
| ------ | ---------------------------------------- | ---- | ----- | ------------------------- |
| GET    | `/products`                              | ✅   | All   | List products (paginated) |
| GET    | `/products?page=1&limit=20&search=papas` | ✅   | All   | Search products           |
| GET    | `/products/:id`                          | ✅   | All   | Get product details       |
| GET    | `/products/category/:catId`              | ✅   | All   | Filter by category        |
| POST   | `/products`                              | ✅   | ADMIN | Create product            |
| PUT    | `/products/:id`                          | ✅   | ADMIN | Update product            |
| DELETE | `/products/:id`                          | ✅   | ADMIN | Delete product            |

### Create Product

```http
POST /products
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "nombre": "Papas 50g",
  "descripcion": "Crujientes",
  "precio": 2250000,
  "stock": 100,
  "categoriaId": "cat-1",
  "imagen": "url..."
}
```

### Query Examples

```
GET /products?page=1&limit=20
GET /products?search=papas
GET /products?page=2&limit=10&search=bebidas
GET /products/category/cat-snacks
```

---

## 🏷️ CATEGORIES

| Method | Endpoint          | Auth | Role  | Description         |
| ------ | ----------------- | ---- | ----- | ------------------- |
| GET    | `/categories`     | ❌   | All   | List all categories |
| GET    | `/categories/:id` | ❌   | All   | Get with products   |
| POST   | `/categories`     | ✅   | ADMIN | Create category     |
| PUT    | `/categories/:id` | ✅   | ADMIN | Update category     |
| DELETE | `/categories/:id` | ✅   | ADMIN | Delete category     |

---

## 📋 ORDERS

| Method | Endpoint             | Auth | Role  | Description       |
| ------ | -------------------- | ---- | ----- | ----------------- |
| POST   | `/orders`            | ✅   | All   | Create order      |
| GET    | `/orders`            | ✅   | All   | List orders       |
| GET    | `/orders/:id`        | ✅   | All   | Get order details |
| PATCH  | `/orders/:id/status` | ✅   | ADMIN | Update status     |
| PATCH  | `/orders/:id/cancel` | ✅   | All   | Cancel order      |

### Create Order

```http
POST /orders
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "items": [
    {
      "productoId": "prod-1",
      "cantidad": 2,
      "precioUnitario": 2250000
    }
  ],
  "notasEntrega": "Entregar en puerta"
}
```

### Order Status

```
PENDIENTE → EN_PREPARACION → ENTREGADO
                    ↓
                CANCELADO
```

---

## 👥 USERS (ADMIN ONLY)

| Method | Endpoint                | Auth | Role  | Description     |
| ------ | ----------------------- | ---- | ----- | --------------- |
| GET    | `/users`                | ✅   | ADMIN | List users      |
| GET    | `/users/:id`            | ✅   | ADMIN | Get user        |
| POST   | `/users`                | ✅   | ADMIN | Create user     |
| PUT    | `/users/:id`            | ✅   | ADMIN | Update user     |
| DELETE | `/users/:id`            | ✅   | ADMIN | Deactivate user |
| POST   | `/users/:id/reactivate` | ✅   | ADMIN | Reactivate user |

---

## 🔑 HEADERS

### Protected Endpoints

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Token Format

```
Authorization: Bearer <access_token>
```

---

## 📊 DATA FORMATS

### Prices (COP - Centavos)

```
Display: $22.500 COP
API: 2250000 (centavos)

Formula: Display Price ÷ 100 = Centavos
```

### Timestamps

```
ISO 8601: "2024-01-16T10:30:00Z"
```

### UUIDs

```
"550e8400-e29b-41d4-a716-446655440000"
```

---

## ✅ HTTP STATUS CODES

| Code | Meaning                        |
| ---- | ------------------------------ |
| 200  | OK - Success                   |
| 201  | Created - Resource created     |
| 400  | Bad Request - Invalid data     |
| 401  | Unauthorized - Invalid token   |
| 403  | Forbidden - No permission      |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Duplicate (email)   |
| 500  | Server Error                   |

---

## 🧪 EXAMPLE REQUESTS

### Get Products

```bash
curl -X GET "http://localhost:3000/api/v1/products?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Order

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productoId": "id1", "cantidad": 2, "precioUnitario": 2250000}],
    "notasEntrega": "Puerta principal"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@inventory.com", "password": "Admin123!"}'
```

### Update Order Status

```bash
curl -X PATCH http://localhost:3000/api/v1/orders/order-id/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado": "EN_PREPARACION"}'
```

---

## 📱 RESPONSE EXAMPLES

### List Products

```json
{
  "data": [
    {
      "id": "prod-1",
      "nombre": "Papas 50g",
      "precio": 2250000,
      "stock": 100,
      "categoria": { "id": "cat-1", "nombre": "Snacks" }
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

### Create Order Response

```json
{
  "id": "order-1",
  "numero": "PED-1705322400000",
  "total": 4500000,
  "estado": "PENDIENTE",
  "usuario": { "id": "user-1", "nombre": "Juan" },
  "items": [
    {
      "id": "item-1",
      "cantidad": 2,
      "precioUnitario": 2250000,
      "subtotal": 4500000,
      "producto": { "id": "prod-1", "nombre": "Papas 50g" }
    }
  ]
}
```

---

## 🧠 COMMON WORKFLOWS

### Customer - Register & Order

```
1. POST /auth/register → Get token
2. GET /products → Browse products
3. GET /products/:id → View details
4. POST /orders → Create order
5. GET /orders/:id → Check status
```

### Admin - Manage Products

```
1. POST /auth/login (admin) → Get token
2. POST /products → Create product
3. PUT /products/:id → Update product
4. DELETE /products/:id → Remove product
5. GET /orders → View all orders
6. PATCH /orders/:id/status → Update status
```

---

## 🔐 AUTHENTICATION FLOW

```
1. Register/Login → Get access_token
2. Include token in header: Authorization: Bearer TOKEN
3. Make request to protected endpoint
4. Server validates token
5. Returns data or 401 Unauthorized
6. Token expires in 24 hours
```

---

## 📝 NOTES

- All prices in **centavos COP** (integer, no decimals)
- Timestamps in **ISO 8601** format
- Passwords hashed with **bcrypt**
- JWT tokens expire in **24 hours**
- Soft deletes preserve audit trail
- Stock automatically updated on orders

---

**Last Updated:** 2024-01-16  
**API Version:** v1  
**Status:** Production Ready ✅
