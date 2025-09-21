# Etapa base
FROM node:18

WORKDIR /app/backend

# Variables de entorno por defecto (pueden sobreescribirse)
ENV NODE_ENV=production \
    PORT=3000 \
    DB_FILE=/data/contacts.db

COPY backend/package*.json ./
# Instalar dependencias del sistema y luego dependencias de producción
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends sqlite3 ca-certificates build-essential python3; \
    rm -rf /var/lib/apt/lists/*; \
    npm install --production; \
    npm cache clean --force; \
    # Asegurar que el binario nativo de sqlite3 se compiló para la imagen correcta
    npm rebuild sqlite3 --build-from-source || true

# Copiar código fuente (solo backend para deps y raíz para estáticos)
COPY backend/. ./
COPY index.html /app/index.html
COPY contact.html /app/contact.html
COPY styles.css /app/styles.css
COPY script.js /app/script.js
COPY README.md /app/README.md

# Crear directorio para base de datos y dar permisos
RUN mkdir -p /data && chown -R node:node /data

# Cambiar a usuario no root por seguridad
USER node

# Exponer puerto
EXPOSE 3000

# Volumen para datos persistentes
VOLUME ["/data"]

# Comando por defecto
CMD ["node", "server.js"]
