import { Pool, QueryResult, PoolClient } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('FATAL: DATABASE_URL environment variable is required but missing.');
}

const pool = new Pool({
  connectionString,
});

export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  return pool.query(text, params);
};

export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};