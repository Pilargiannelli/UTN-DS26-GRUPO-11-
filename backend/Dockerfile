# Imagen base: punto de partida minimo con Node.js
FROM node:22-alpine

# Sin telemetria: Prisma no reporta uso ni avisa de nuevas versiones.
# Se definen antes que nada para que tambien apliquen durante el build.
ENV CHECKPOINT_DISABLE=1 \
    PRISMA_HIDE_UPDATE_MESSAGE=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

# Los query engines de Prisma necesitan openssl en Alpine
RUN apk add --no-cache openssl

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo archivos de dependencias
COPY package*.json ./

# Instalar dependencias en la imagen
RUN npm install

# Schema y config de Prisma antes del resto del codigo: asi esta capa se cachea
# y el build falla temprano si el schema tiene errores.
COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npx prisma generate

# Copiar el resto del codigo fuente
COPY . .

# Puertos que expone el contenedor
EXPOSE 3000 5555

# Comando por defecto (en desarrollo lo pisa el "command" de docker-compose.yml)
CMD ["npm", "run", "dev"]
