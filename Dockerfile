FROM node:20-slim

WORKDIR /app
RUN apt-get update && apt-get install -y build-essential python3 && rm -rf /var/lib/apt/lists/*
COPY ./package.json .
RUN npm install

COPY . .

EXPOSE 4321

CMD ["npm", "run", "dev"]
