import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false, // Set to true to see SQL queries in the console
  dialectOptions: {
    // Add ssl options if your cloud provider requires it
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false
    // }
  }
});
