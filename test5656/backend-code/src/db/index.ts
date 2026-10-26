import { Pool, QueryResult, QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;
const dbPassword = process.env.PGPASSWORD;

if (!connectionString && !dbPassword) {
  console.error('CRITICAL: Database connection credentials are missing. Set DATABASE_URL or PGPASSWORD environment variables.');
  process.exit(1);
}

const pool = new Pool(
  connectionString ? { connectionString } : undefined
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};