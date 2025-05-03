# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copiar arquivos de dependências primeiro para melhor uso de cache
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar código fonte
COPY . .

# Construir aplicação (para produção)
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Criar usuário não-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Instalar servidor de produção
RUN npm install -g serve

# Copiar build do estágio anterior
COPY --from=build /app/dist ./dist

# Definir usuário não-root
USER appuser

EXPOSE 3000

# Comando para ambiente de produção
CMD ["serve", "-s", "dist", "-l", "3000"]

# Development stage - use esta imagem adicionando target ao build no docker-compose
FROM node:18-alpine AS development

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Não precisamos copiar o código fonte aqui pois usamos volume

EXPOSE 3000

# Comando para ambiente de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]