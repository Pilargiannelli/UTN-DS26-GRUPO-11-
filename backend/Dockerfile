# Imagen base: punto de partida mínimo con Node.js
FROM node:22-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo archivos de dependencias
COPY package*.json ./

# Instalar dependencias en la imagen
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto que la app escucha
EXPOSE 3000

# Comando por defecto al iniciar el contenedor
CMD ["npm", "run", "dev"]
