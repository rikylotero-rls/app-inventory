# Validación del Flujo Completo de Pedidos

## Checklist de Pruebas

### 1. **Backend corriendo**

```bash
cd backend
npm run start
# Debe estar en http://localhost:3000
```

### 2. **Frontend corriendo (servidor)**

```bash
cd server
node server.js
# O simplemente abrir public/html/index.html en el navegador
```

### 3. **Crear una Cuenta Cliente**

- Ir a `index.html` → "Iniciar sesión"
- Click en "Crear cuenta"
- Registrar con:
  - Nombre: Test Client
  - Email: client@test.com
  - Teléfono: 3001234567
  - Contraseña: test123
- Se debe redirigir a `index.html`

### 4. **Agregar Productos al Carrito**

- Buscar productos en `index.html`
- Hacer click en "Agregar al Carrito"
- Debería mostrar notificación de éxito
- El contador del carrito debe aumentar

### 5. **Finalizar Pedido**

- Click en icono de carrito (esquina superior derecha)
- Click en "Finalizar Pedido"
- Debería validar que hay productos en el carrito
- Hacer click en "Confirmar y Pagar"

### 6. **Validar Redirección a Confirmación**

- Debe redirigir a `confirmacion-pedido.html?pedido=<ID>`
- En la URL debe verse el parámetro `pedido` con un ID válido (ej: `abc123def456`)

### 7. **Validar Datos en Página de Confirmación**

**Si ves error 401 (Unauthorized):**

1. Abre la consola (F12)
2. Copia y pega esto:

```javascript
const usuarioJSON = localStorage.getItem("usuario");
const usuario = usuarioJSON ? JSON.parse(usuarioJSON) : null;
console.log("Usuario:", usuario);
console.log(
  "Token:",
  usuario?.access_token
    ? usuario.access_token.substring(0, 20) + "..."
    : "NO HAY TOKEN",
);
```

3. Si el token es vacío, **la sesión expiró o no se guardó**.
4. **Solución:** Vuelve a index.html, cierra sesión y vuelve a iniciar sesión.

**Si el token existe:**

- Los datos del pedido deben cargarse automáticamente
- Verifica que la consola muestre: `"Datos del pedido desde backend: {...}"`

**En la página debe verse:**

- ✅ Número de Radicado: `PED-<timestamp>` (ej: `PED-1701234567890`)
- ✅ Nombre del Cliente: El que registraste
- ✅ Teléfono: El que registraste
- ✅ Total Items: La cantidad de productos agregados
- ✅ Monto Total: La suma correcta en formato moneda
- ✅ Hora: La hora actual

### 8. **Validar WhatsApp del Admin**

⚠️ **Importante:** Actualmente WhatsApp usa `wa.me` que requiere manual. Para envío automático se requiere integrar Twilio o Chat-API.

**Flujo actual:**

1. Cuando se crea un pedido, se genera una URL de WhatsApp
2. La URL se registra en los **logs del servidor backend** (terminal donde corre NestJS)
3. Para enviar el mensaje, **copia la URL de los logs y abre en el navegador**

**Dónde ver los mensajes:**

- Abre la **terminal donde corre el backend** (`npm run start:dev`)
- Busca líneas que digan: `📱 MENSAJE WHATSAPP GENERADO`
- Verás:
  ```
  [Nest] 12345 - 01/31/2026, 10:30:45 AM   LOG [NotificationsService] 📱 MENSAJE WHATSAPP GENERADO
     Teléfono: 573116579677
     Mensaje: Hola Administrador, Se ha recibido un nuevo pedido...
     URL: https://wa.me/573116579677?text=...
     Para usar: Abre https://wa.me/... en el navegador
  ```

4. Copia la URL `https://wa.me/...` y abre en el navegador
5. Se abrirá WhatsApp Web con el mensaje predefinido
6. Click en "Enviar" para completar

### 9. **Admin Confirma Pedido**

- Ir a `admin.html`
- Iniciar sesión como admin (admin@inventory.com / admin123)
- Click en "Pedidos" en el menú lateral
- Debe verse la lista de pedidos cargada
- Click en "✓ Confirmar Pedido"
- Se enviará automáticamente notificación WhatsApp al cliente (ver logs en terminal backend)

### 10. **Cliente Recibe Confirmación**

- El cliente recibe automáticamente un mensaje de WhatsApp (ver logs en terminal backend)
- En la página de confirmación debe cambiar el estado a "✅ Pedido Confirmado"
- Los datos del pedido se actualizan automáticamente en el frontend

## Resumen: Estado del Flujo WhatsApp

| Evento                | Estado       | Detalles                                                           |
| --------------------- | ------------ | ------------------------------------------------------------------ |
| Cliente crea pedido   | ✅ Funciona  | Genera URL en logs, admin la abre manualmente                      |
| Admin confirma pedido | ✅ Funciona  | Genera URL en logs, cliente la abre manualmente (si la configuras) |
| Envío automático      | ⏳ Pendiente | Requiere integración con Twilio/Chat-API/WhatsApp Business         |

### Cómo ver los mensajes WhatsApp generados:

**En terminal (donde corre el backend):**

```bash
npm run start:dev
# Busca líneas como:
# [Nest] LOG [NotificationsService] 📱 MENSAJE WHATSAPP GENERADO
#    Teléfono: 573116579677
#    URL: https://wa.me/...
```

## Problemas Comunes y Soluciones

### ❌ "No se proporcionó ID de pedido en la URL"

**Causa:** La URL no tiene el parámetro `?pedido=ID`
**Solución:** Verificar que `app.js` línea 242 redirija correctamente con `pedidoCreado.id`

### ❌ "Error al cargar el pedido: Error: Error 401: Unauthorized"

**Causa:** El token no es válido, no existe o expiró.
**Soluciones:**

1. Abre la consola (F12)
2. Ejecuta:

```javascript
const usuarioJSON = localStorage.getItem("usuario");
const usuario = usuarioJSON ? JSON.parse(usuarioJSON) : null;
console.log("Usuario guardado:", usuario);
console.log("¿Tiene token?:", !!usuario?.access_token);
```

3. Si `usuario` es `null`, necesitas **iniciar sesión de nuevo**.
4. Si `¿Tiene token?` es `false`, hubo un error en el login.
5. Si es `true` pero aún da 401, el token está **expirado o el backend no lo reconoce**.

**Verificación rápida:**

```javascript
const usuarioJSON = localStorage.getItem("usuario");
if (usuarioJSON) {
  const usuario = JSON.parse(usuarioJSON);
  if (usuario.access_token) {
    console.log("✅ Token existe. Primeros 30 caracteres:");
    console.log(usuario.access_token.substring(0, 30));
  } else {
    console.log("❌ No hay token en usuario. Inicia sesión nuevamente.");
  }
} else {
  console.log("❌ No hay usuario guardado. Inicia sesión.");
}
```

### ❌ Datos mostrando "-" o "0"

**Causa:** El backend retorna datos con estructura diferente
**Solución:** Revisar en la consola el objeto `pedido` y comparar con las propiedades que espera `confirmacion-pedido.html`

### ❌ El número de radicado dice "RAD-0000000-000"

**Causa:** `pedido.numero` no se está capturando
**Solución:** Cambiar línea en `confirmacion-pedido.html`:

```javascript
const numeroRadicado = pedido.numero || pedido.id || idPedido;
// Verificar que pedido.numero tenga un valor
```

## Headers HTTP Esperados

### POST /api/v1/orders (crear pedido)

```
Authorization: Bearer <user-token>
Content-Type: application/json
Body: {
  items: [
    { productoId: "id", cantidad: 1, precioUnitario: 10000 }
  ]
}
Response: {
  id: "abc123",
  numero: "PED-1701234567890",
  estado: "PENDIENTE",
  usuario: { nombre, telefono, email },
  items: [],
  total: 10000,
  createdAt: "2026-01-30T..."
}
```

### GET /api/v1/orders/:id (obtener pedido)

```
Authorization: Bearer <user-token>
Response: {
  id: "abc123",
  numero: "PED-1701234567890",
  estado: "PENDIENTE",
  usuario: { nombre, telefono },
  items: [],
  total: 10000,
  createdAt: "2026-01-30T..."
}
```

## Debug en Consola

```javascript
// Ver token del cliente
console.log("Token cliente:", localStorage.getItem("user-token"));

// Ver datos del usuario
console.log("Usuario:", localStorage.getItem("usuario"));

// Hacer fetch manual para probar
fetch("http://localhost:3000/api/v1/orders/ID_DEL_PEDIDO", {
  headers: {
    Authorization: "Bearer " + localStorage.getItem("user-token"),
  },
})
  .then((r) => r.json())
  .then((d) => console.log("Pedido:", d));
```

## Estado del Flujo

- ✅ app.js: Crea pedido correctamente
- ✅ app.js: Redirecciona con parámetro `?pedido=ID`
- ✅ confirmacion-pedido.html: Obtiene datos del backend
- ✅ confirmacion-pedido.html: Muestra datos en pantalla
- ✅ Backend: Envía WhatsApp al admin al crear pedido
- ✅ Backend: Envía WhatsApp al cliente al confirmar pedido
- ⏳ Admin panel: Verificar que se carguen pedidos al presionar "Pedidos"
