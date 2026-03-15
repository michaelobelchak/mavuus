FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN mkdir -p db uploads/avatars uploads/resumes
EXPOSE 3001
CMD ["node", "index.js"]
