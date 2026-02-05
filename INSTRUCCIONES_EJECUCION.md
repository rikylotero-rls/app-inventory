# ⚡ Ejecutar la Aplicación

Para que los productos reales se carguen correctamente, debes ejecutar la aplicación a través del servidor Express.

## 🚀 Pasos rápidos:

### 1. Abre una terminal en la carpeta del proyecto

```bash
cd "c:\Users\Equipo\Desktop\inventory app"
```

### 2. Instala las dependencias (si no las has instalado)

```bash
npm install
```

### 3. Inicia el servidor

```bash
npm start
```

O si usas npm:

```bash
node server/server.js
```

### 4. Abre en tu navegador

```
http://localhost:3000
```

## ✅ Resultado esperado:

Cuando abras `http://localhost:3000` deberías ver:

- ✅ 70 productos reales cargados del archivo `public/data/products.json`
- ✅ Papas, Ripios, Maíz, Guantes, Láminas, etc.
- ✅ NO verás más "Jabón Líquido", "Gaseosa", etc. (esos eran de prueba)

## 🔍 Verificar en la consola del navegador:

1. Abre Developer Tools: `F12`
2. Ve a la pestaña "Console"
3. Deberías ver:
   ```
   Productos cargados del JSON: 70
   Productos transformados: 70
   ```

Si ves errores, comparte la captura de pantalla de la consola.

## 📁 Ubicaciones clave:

- **Servidor:** `server/server.js`
- **HTML principal:** `public/html/index.html`
- **Productos JSON:** `public/data/products.json`
- **JavaScript:** `public/js/app.js` (carga los productos)

---

**¿Ejecutaste el servidor?** Avísame si ves los productos reales ahora. 🎯
