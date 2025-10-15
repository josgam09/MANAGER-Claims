# 🚀 Instrucciones para Iniciar el Servidor

## 📝 Scripts Disponibles

### 1. **iniciar-servidor-8080.bat**
Inicia el servidor de desarrollo siempre en el puerto **8080**.

**Uso:**
- Haz doble clic en el archivo `iniciar-servidor-8080.bat`
- El script automáticamente:
  - ✅ Detiene cualquier servidor anterior
  - ✅ Inicia el servidor en http://localhost:8080
  - ✅ Mantiene la ventana abierta para ver logs

**Acceso:**
```
http://localhost:8080
```

---

### 2. **detener-servidor.bat**
Detiene todos los servidores Node.js corriendo.

**Uso:**
- Haz doble clic en el archivo `detener-servidor.bat`
- El script detiene todos los procesos Node activos

---

## 🔧 Solución de Problemas

### ❌ "Puerto 8080 en uso"
Si el servidor no inicia en el puerto 8080:
1. Ejecuta primero `detener-servidor.bat`
2. Espera 3 segundos
3. Ejecuta `iniciar-servidor-8080.bat`

### ❌ Error de permisos
Si aparece un error de permisos:
1. Cierra todas las ventanas de PowerShell/CMD
2. Ejecuta `detener-servidor.bat` como Administrador
3. Intenta de nuevo

---

## 🎯 Forma Manual (Alternativa)

Si prefieres iniciar el servidor manualmente:

```powershell
cd "ruta/al/proyecto/crm-claims-js"
$env:BROWSER='none'
$env:PORT='8080'
npm run dev
```

---

## 📊 Puertos del Sistema

| Puerto | Uso |
|--------|-----|
| **8080** | Frontend MANAGER Claims (Principal) |
| 8081 | Alternativo (si 8080 ocupado) |
| 8082 | Alternativo (si 8080 y 8081 ocupados) |
| 3001 | Backend API (Cuando esté activo) |

---

## 🔐 Credenciales de Demo

### Administrador:
- **Email:** admin@jetsmart.com
- **Contraseña:** admin123

### Supervisor:
- **Email:** supervisor@jetsmart.com
- **Contraseña:** super123

### Analista:
- **Email:** analyst@jetsmart.com
- **Contraseña:** analyst123

---

## 📱 Navegadores Soportados

- ✅ Google Chrome (Recomendado)
- ✅ Microsoft Edge
- ✅ Firefox
- ⚠️ Safari (funcional pero no optimizado)

---

## 🆘 Ayuda

Si tienes problemas:
1. Verifica que Node.js esté instalado: `node --version`
2. Verifica que npm esté instalado: `npm --version`
3. Reinstala dependencias: `npm install`
4. Limpia cache: `npm run build` y luego `npm run dev`

---

**Última actualización:** Octubre 2025
**Versión:** 1.0.0

