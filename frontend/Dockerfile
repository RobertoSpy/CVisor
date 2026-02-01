FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Environment variables for build
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY

EXPOSE 3000

# Build pentru producție
RUN npm run build

# Rulează în production mode
CMD ["npm", "run", "start"]