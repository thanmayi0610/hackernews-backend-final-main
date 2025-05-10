FROM node:20

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

# Optional: generate Prisma client if schema exists
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; else echo "Skipping prisma generate"; fi

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
