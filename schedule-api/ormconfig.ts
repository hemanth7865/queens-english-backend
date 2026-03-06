import { ConnectionOptions } from "typeorm";

const config: ConnectionOptions = {
  type: "mssql",
  host: process.env.DB_HOST || process.env.MSSQL_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || process.env.MSSQL_PORT || "1433"),
  username: process.env.DB_USER || process.env.MSSQL_USER || "root",
  password: process.env.DB_PASSWORD || process.env.MSSQL_PASSWORD || "",
  database: process.env.DB_NAME || process.env.MSSQL_DATABASE || "admin",
  synchronize: false,
  logging: ["error"],
  logger: "file",
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  options: {
    encrypt: process.env.NODE_ENV === "production",
    trustServerCertificate: true,
  },
};

export = config;
