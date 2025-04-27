import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise();

const cn = {
  host: process.env.PG_HOST as string,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DATABASE as string,
  user: process.env.PG_USER as string,
  password: process.env.PG_PASSWORD as string, 
};

const db = pgp(cn);

export default db;
