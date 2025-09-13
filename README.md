# U La Salle Contact Form

Una aplicación web simple con formulario de contacto desarrollada con HTML, CSS, JavaScript y Node.js con base de datos SQLite.

## Características

- Página principal con información de bienvenida
- Formulario de contacto con validación en tiempo real
- Almacenamiento de datos en base de datos SQLite
- Servidor Node.js con API REST
- Diseño responsivo y moderno
- Validación tanto del lado cliente como del servidor

## Campos del Formulario

- **Nombre completo** (obligatorio, 2-100 caracteres)
- **Correo electrónico** (obligatorio, formato válido)
- **Asunto** (obligatorio, 5-200 caracteres)
- **Mensaje** (obligatorio, 10-1000 caracteres)

## Instalación y Uso

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

### Instalación

1. Clonar o descargar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```

### Ejecutar la aplicación

1. Iniciar el servidor:
   ```bash
   npm start
   ```
   
   O para desarrollo con auto-recarga:
   ```bash
   npm run dev
   ```

2. Abrir navegador y visitar: `http://localhost:3000`

## Estructura del Proyecto

```
├── index.html          # Página principal
├── contact.html        # Página del formulario de contacto
├── styles.css          # Estilos CSS
├── script.js           # JavaScript del cliente
├── server.js           # Servidor Node.js
├── package.json        # Configuración y dependencias
├── contacts.db         # Base de datos SQLite (se crea automáticamente)
└── README.md          # Este archivo
```

## API Endpoints

- `POST /api/contact` - Enviar formulario de contacto
- `GET /api/contacts` - Obtener todos los contactos
- `GET /api/stats` - Obtener estadísticas de contactos
- `GET /api/health` - Estado del servidor

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Base de datos**: SQLite3
- **Librerías**: cors, body-parser

## Funcionalidades

### Frontend
- Validación en tiempo real de formularios
- Mensajes de error y éxito
- Diseño responsivo para móviles y escritorio
- Navegación entre páginas

### Backend
- API REST para manejo de contactos
- Validación de datos del servidor
- Almacenamiento persistente en SQLite
- Manejo de errores y logging

### Base de Datos
- Tabla de contactos con campos requeridos
- Timestamps automáticos
- Consultas optimizadas

## Despliegue

Para desplegar en un servidor:

1. Configurar variable de entorno PORT si es necesario
2. Asegurar que Node.js esté instalado en el servidor
3. Ejecutar `npm install --production`
4. Iniciar con `npm start`

## Desarrollo

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear rama para nueva característica
3. Realizar cambios y pruebas
4. Submit pull request

## Licencia

MIT License
