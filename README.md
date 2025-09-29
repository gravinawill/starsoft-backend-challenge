# Teste para Desenvolvedor(a) Back-End Node.js/Nest.js

## Link para o que eu pensei/planejei fazer está no eraser com comentários

[Documentação no Eraser com comentários](https://app.eraser.io/workspace/bq62lo9hU9W9Rk7hD9Ls?origin=share)

![O que eu planejei](o-que-eu-planejei-para-fazer.png)

Tempo de desenvolvimento: [![wakatime](https://wakatime.com/badge/user/9ea7b7c5-e5b7-4c24-aa4e-ca4bef7484b7/project/927f8b31-2c0b-42c4-823a-9e977ee41bc5.svg)](https://wakatime.com/badge/user/9ea7b7c5-e5b7-4c24-aa4e-ca4bef7484b7/project/927f8b31-2c0b-42c4-823a-9e977ee41bc5)

## Como rodar o projeto

1. Instale o pnpm globalmente (se ainda não tiver):

   ```bash
   npm i -g pnpm
   ```

2. Suba a infraestrutura com Docker Compose:

   ```bash
   cp .env.example .env
   cp infra/docker/.env.example infra/docker/.env
   ```

   ```bash
   cd ./infra/docker
   ```

   ```bash
   docker compose up -d
   ```

3. Em outro terminal, rode as aplicações em modo desenvolvimento:

   ```bash
   pnpm run dev:apps
   ```
