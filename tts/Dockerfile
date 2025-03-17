FROM node:22.11.0-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .
#COPY .env .env

EXPOSE 80
ENV ENV=staging
CMD ["node", "-r", "dotenv/config", "src/index.js"]
# CMD ["npm", "run", "staging"]
