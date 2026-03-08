import { ConnectionOptions } from "typeorm";

const config: ConnectionOptions = {
  type: "mssql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "1433"),
  username: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "admin",
  synchronize: false,
  logging: false,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

export = config;
