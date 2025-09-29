import { DataSource } from 'typeorm'

const typeOrmConfig = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRESQL_HOST,
  port: process.env.POSTGRESQL_PORT ? Number(process.env.POSTGRESQL_PORT) : undefined,
  database: process.env.POSTGRESQL_DATABASE_ORDERS_SERVER,
  username: process.env.POSTGRESQL_USERNAME,
  password: process.env.POSTGRESQL_PASSWORD,
  entities: ['./src/**/entities/*.entity{.ts,.js}'],
  migrations: ['./migrations/**/*{.ts,.js}'],
  migrationsRun: false,
  synchronize: false
})

export default typeOrmConfig
