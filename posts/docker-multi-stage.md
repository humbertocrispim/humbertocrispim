Uma imagem Docker de produção não precisa carregar compilador, cache de dependências nem arquivos de teste. O build **multi-stage** resolve isso: você usa vários `FROM` no mesmo `Dockerfile` e copia para a imagem final só o resultado do build.

## O problema

Num `Dockerfile` de um estágio só, tudo o que foi instalado para compilar continua na imagem final. Ela fica maior, demora mais para baixar e expõe mais pacotes a vulnerabilidades.

## A solução

```dockerfile
# Estágio 1: build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio 2: execução
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/server.js"]
```

O segundo estágio começa limpo. A linha `COPY --from=build` traz apenas a pasta `dist` gerada no primeiro estágio.

## Boas práticas

1. Dê nome aos estágios com `AS` para deixar o `COPY --from` legível.
2. Copie os arquivos de dependências antes do código para aproveitar o cache de camadas.
3. Use uma imagem base pequena no estágio final, como as variantes `alpine` ou `distroless`.

Para conferir o ganho, compare o tamanho das imagens com `docker images`.
