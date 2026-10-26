FROM node:20-alpine

WORKDIR /app

# Copiar e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 5173

# Comando para iniciar el servidor de desarrollo exponiéndolo a la red de Docker
CMD ["npm", "run", "dev", "--", "--host"]