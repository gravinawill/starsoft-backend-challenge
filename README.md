# Teste para Desenvolvedor(a) Back-End Node.js/Nest.js

## Link para o que eu pensei/planejei fazer está no eraser com comentários

[Documentação no Eraser com comentários](https://app.eraser.io/workspace/bq62lo9hU9W9Rk7hD9Ls?origin=share)

![O que eu planejei](o-que-eu-planejei-para-fazer.png)

Tempo de desenvolvimento: [![wakatime](https://wakatime.com/badge/user/9ea7b7c5-e5b7-4c24-aa4e-ca4bef7484b7/project/927f8b31-2c0b-42c4-823a-9e977ee41bc5.svg)](https://wakatime.com/badge/user/9ea7b7c5-e5b7-4c24-aa4e-ca4bef7484b7/project/927f8b31-2c0b-42c4-823a-9e977ee41bc5)

## Como rodar o projeto

### Configuração de Variáveis de Ambiente

Antes de iniciar, configure as variáveis de ambiente:

```bash
# Copie o arquivo .env.example para .env
cp .env.example .env

# Edite o arquivo .env com suas configurações (opcional)
# Para desenvolvimento local, os valores padrão geralmente funcionam
```

📖 **Para documentação completa sobre variáveis de ambiente, consulte [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)**

### Passos para executar

1. Instale o pnpm globalmente (se ainda não tiver):

   ```bash
   npm i -g pnpm
   ```

2. Instale as dependências:

   ```bash
   pnpm install
   ```

3. Suba a infraestrutura com Docker Compose:

   ```bash
   cd ./infra/docker
   docker compose up -d
   ```

4. Em outro terminal (na raiz do projeto), rode as aplicações em modo desenvolvimento:

   ```bash
   pnpm run dev:apps
   ```

### Serviços Disponíveis

Após iniciar, os seguintes serviços estarão disponíveis:

- **Users Server**: http://localhost:2230
- **Products Catalog Server**: http://localhost:2226
- **Product Inventory Server**: http://localhost:2227
- **Orders Server**: http://localhost:2229
- **Notification Server**: http://localhost:2228
- **PostgreSQL**: localhost:5432
- **Kafka**: localhost:9094
- **Elasticsearch**: http://localhost:9200
