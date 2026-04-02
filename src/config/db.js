import { Sequelize } from "sequelize";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, NODE_ENV } =
  process.env;
const isProduction = NODE_ENV === "production";

// Step 1: Create database if not exists
async function createDatabaseIfNotExists() {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT || 3306,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    console.log(`Database '${DB_NAME}' is ready`);
    await connection.end();
  } catch (err) {
    console.error("DB creation error:", err);
    process.exit(1);
  }
}

// Step 2: Initialize Sequelize
async function initSequelize() {
  await createDatabaseIfNotExists();

  const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT || 3306,
    dialect: "mysql",
    logging: isProduction ? false : console.log,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    retry: { max: 3 },
    dialectOptions: isProduction
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  });

  try {
    await sequelize.authenticate();
    console.log("Sequelize connected to DB");
  } catch (err) {
    console.error("Sequelize connection error:", err);
    process.exit(1);
  }

  return sequelize;
}

const sequelize = await initSequelize();
export default sequelize;
