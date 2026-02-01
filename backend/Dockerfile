FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN mkdir -p /app/uploads   
EXPOSE 5000
CMD ["node", "app.js"]