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

## Ejecución (Solo Docker)

La aplicación está diseñada para ejecutarse únicamente dentro de contenedores Docker. No se brinda soporte oficial para ejecución directa con Node en el host.

### Prerrequisitos

- Docker Desktop (macOS / Windows) o Docker Engine (Linux)
- Docker Compose v2 (incluido en Docker Desktop moderno)

### Puesta en marcha rápida

```bash
git clone <repo>
cd ingsof-workshop-prc
docker compose up -d --build
```

Abrir en el navegador:

- <http://localhost:3000> (Inicio)
- <http://localhost:3000/contact> (Formulario)

Verificar salud:

```bash
curl -s http://localhost:3000/api/health
```

### Flujo de actualización de cambios

Tras modificar código fuente:

```bash
docker compose up -d --build
```

Forzar reconstrucción sin caché (p.ej. nuevas dependencias):

```bash
docker compose build --no-cache web
docker compose up -d
```

Reiniciar solo el servicio:

```bash
docker compose restart web
```

Detener y mantener datos:

```bash
docker compose down
```

Detener y eliminar datos (volumen y base):

```bash
docker compose down -v
```

### Variables de entorno

Archivo `.env.example` con valores base. Para personalizar:

```bash
cp .env.example .env
```

Variables claves:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| PORT     | Puerto expuesto de la app | 3000 |
| DB_FILE  | Ruta interna del archivo SQLite | /data/contacts.db |

Cambiar ubicación de la base:

```bash
DB_FILE=/data/custom.sqlite docker compose up -d --build
```

### Consultas a la base de datos

Últimos registros:

```bash
docker compose exec web sqlite3 -header -column /data/contacts.db "SELECT id,name,subject FROM contacts ORDER BY id DESC LIMIT 5;"
```

Estadísticas:

```bash
docker compose exec web node query.js stats
```

Consulta ad-hoc:

```bash
docker compose exec web node query.js "SELECT COUNT(*) total FROM contacts"
```

Copiar la base al host:

```bash
docker compose cp web:/data/contacts.db contacts.db
```

Reiniciar base (borrar datos):

```bash
docker compose down -v && docker compose up -d --build
```

### Logs

```bash
docker compose logs -f
```

### Healthcheck manual

```bash
curl -i http://localhost:3000/api/health
```

### Estructura resumida

```
├── index.html
├── contact.html
├── styles.css
├── script.js
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── query.js
│   └── contacts.db (creada en runtime si DB_FILE apunta aquí)
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Estructura del Proyecto

```
├── index.html              # Página principal
├── contact.html            # Formulario de contacto
├── styles.css              # Estilos CSS
├── script.js               # JavaScript del cliente
├── backend/                # Código backend
│   ├── server.js           # Servidor Express + API
│   ├── package.json        # Dependencias backend
│   └── contacts.db         # Base de datos SQLite (si se ejecuta fuera de Docker)
├── Dockerfile              # Imagen Docker (usa backend/)
├── docker-compose.yml      # Orquestación para desarrollo
├── .env.example            # Variables ejemplo
├── .dockerignore           # Ignora artefactos en build
└── README.md               # Documentación
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

### Despliegue con Docker

#### Build y ejecución directa

```bash
docker build -t contact-form-app .
docker run -d --name contact-form -p 3000:3000 -v contact_data:/data contact-form-app
```

Esto creará un volumen llamado `contact_data` donde se persistirá la base de datos SQLite (`/data/contacts.db`).

Revisar logs:

```bash
docker logs -f contact-form
```

Detener y eliminar contenedor:

```bash
docker stop contact-form && docker rm contact-form
```

#### Usando docker-compose

Archivo `docker-compose.yml` incluido. Ejecutar:

```bash
docker compose up -d --build
```

Ver estado de salud:

```bash
docker compose ps
```

Ver logs:

```bash
docker compose logs -f
```

Apagar servicios:

```bash
docker compose down
```

Conservar datos (volumen `db_data`) incluso tras `down`. Para borrarlo:

```bash
docker compose down -v
```

#### Variables de entorno

Copiar el archivo `.env.example` a `.env` y ajustar según necesidad:

```bash
cp .env.example .env
```

Variables principales:

- `PORT`: Puerto de la app (por defecto 3000)
- `DB_FILE`: Ruta del archivo SQLite dentro del contenedor (`/data/contacts.db`)

#### Probar

Abrir en el navegador:

```
http://localhost:3000
```

Chequeo de salud:

```
http://localhost:3000/api/health
```

## Desarrollo

### Consultar la base de datos (SQLite)

#### 1. Usando los scripts de Node (recomendado)

Desde `backend/`:

```bash
npm run db:stats     # Totales y métricas
npm run db:last      # Últimos 10 registros
npm run db:query -- "SELECT id,name,subject FROM contacts LIMIT 5"  # Consulta ad-hoc
```

También puedes ejecutar directamente:

```bash
node query.js last 5
node query.js stats
node query.js "SELECT COUNT(*) AS total FROM contacts"
```

#### 2. Dentro del contenedor Docker

Primero asegúrate de que el contenedor esté corriendo:

```bash
docker compose up -d --build
```

Ejecutar consultas con el binario `sqlite3` instalado en la imagen:

```bash
docker compose exec web sqlite3 /data/contacts.db "SELECT id,name,subject FROM contacts ORDER BY id DESC LIMIT 5;"
```

Formato de tabla legible:

```bash
docker compose exec web sqlite3 -header -column /data/contacts.db "SELECT id,name,email,subject FROM contacts LIMIT 5;"
```

Contar registros:

```bash
docker compose exec web sqlite3 /data/contacts.db "SELECT COUNT(*) FROM contacts;"
```

#### 3. Copiar la base de datos a tu máquina

```bash
docker compose cp web:/data/contacts.db contacts.db
sqlite3 contacts.db "SELECT COUNT(*) FROM contacts;"
```

#### 4. Cambiar la ubicación de la base de datos

Configura la variable `DB_FILE` antes de iniciar:

```bash
DB_FILE=/data/mis_contactos.sqlite docker compose up -d --build
```

#### 5. Reiniciar la base (borrar datos)

```bash
docker compose down
docker compose exec web rm /data/contacts.db   # (si ya está arriba, o simplemente elimina el volumen)
docker compose down -v  # elimina también el volumen
docker compose up -d --build
```

La tabla se recreará automáticamente al levantar el servidor.

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear rama para nueva característica
3. Realizar cambios y pruebas
4. Submit pull request

## Licencia

MIT License
