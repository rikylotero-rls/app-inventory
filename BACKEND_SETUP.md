# GUÍA DE INICIO RÁPIDO - BACKEND

## ¿Completamos la instalación del Backend?

El backend está completamente configurado. Ahora necesitas:

### 1️⃣ REQUISITOS PREVIOS

```
✅ Node.js 18+ instalado
✅ PostgreSQL 12+ instalado y ejecutándose
✅ npm o yarn disponible
```

### 2️⃣ INSTALAR Y CONFIGURAR

```bash
# 1. Ir a carpeta backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Crear base de datos PostgreSQL
createdb inventory_db

# 4. Actualizar .env con tus credenciales PostgreSQL
# Editar: backend/.env
# Cambiar DATABASE_URL a tu conexión real
# Ejemplo: postgresql://postgres:micontraseña@localhost:5432/inventory_db

# 5. Ejecutar migraciones
npm run prisma:migrate

# 6. Cargar datos iniciales (70 productos + usuarios de prueba)
npm run prisma:seed

# 7. Iniciar servidor
npm run start:dev
```

### 3️⃣ USUARIOS DE PRUEBA

**Admin:**

- Email: `admin@inventory.com`
- Contraseña: `Admin123!`

**Cliente:**

- Email: `cliente@example.com`
- Contraseña: `Cliente123!`

### 4️⃣ API DISPONIBLE EN

```
http://localhost:3000/api/v1
```

### 5️⃣ PROBAR API CON POSTMAN/THUNDER CLIENT

**Ejemplo - Login:**

```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@inventory.com",
  "password": "Admin123!"
}
```

**Respuesta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "nombre": "Admin",
    "email": "admin@inventory.com",
    "rol": "ADMIN"
  }
}
```

---

## ESTRUCTURA DEL BACKEND

✅ **Completado:**

- ✅ Autenticación (JWT + bcrypt)
- ✅ Módulo Productos (CRUD + búsqueda + paginación)
- ✅ Módulo Categorías (CRUD)
- ✅ Módulo Órdenes (crear, listar, actualizar estado, cancelar)
- ✅ Módulo Usuarios (gestión de usuarios para ADMIN)
- ✅ Base de datos Prisma + PostgreSQL
- ✅ Seed con 70 productos + categorías
- ✅ Validación DTOs
- ✅ CORS configurado
- ✅ Control de acceso basado en roles

---

## PRÓXIMAS TAREAS

1. **Conectar Frontend a Backend**
   - Actualizar `public/js/app.js` para llamar a endpoints API
   - Usar `fetch()` o librerías como `axios`

2. **Admin Dashboard**
   - Crear interfaz para gestionar productos
   - Gestionar órdenes
   - Ver reportes

3. **Pagos**
   - Integrar pasarela de pago (Wompi, PayPal, Stripe)

---

## AYUDA RÁPIDA

Más detalles en: `backend/README.md`

¿Problemas? Revisar:

- [Solución de Problemas](./backend/README.md#solución-de-problemas)
