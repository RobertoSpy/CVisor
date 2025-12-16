FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000

# Build pentru producție
RUN npm run build

# Rulează în production mode
CMD ["npm", "run", "start"]