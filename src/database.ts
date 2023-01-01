import mysql from 'mysql';
import util from 'util';
import { z } from 'zod';
import { env } from './env/env';

const connect = () => {
  const connection = mysql.createConnection({
    socketPath: '/tmp/mysql.sock',
    port: 3306,
    host: env.DATABASE_HOST,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
  });

  connection.connect(err => {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }

    console.log('connected as id ' + connection.threadId);
  });

  return connection;
};

const connection = connect();

const queryDb = util.promisify(connection.query).bind(connection);

const safeQuery = async <T extends z.ZodRawShape>(
  query: string,
  schema: z.ZodArray<z.ZodObject<T>> | z.ZodObject<T>
) => {
  const res = await queryDb(query);

  try {
    const [row] = z.tuple([schema]).parse(res);
    return row;
  } catch {
    console.warn(`❌ Parsing query failed: ${query}`);
    throw new Error('Parsing query failed');
  }
};

export const getLeaderboard = async () => {
  const TOP = 50;
  const ORDER_BY = 'rounded_ratio';
  const query = `select cast(ratio as decimal(10, 2)) as rounded_ratio, kd.* from kd order by ${ORDER_BY} desc limit ${TOP}`;

  const schema = z.array(
    z.object({
      identifier: z.string(),
      kills: z.number(),
      deaths: z.number(),
      rounded_ratio: z.number(),
    })
  );

  const data = await safeQuery(query, schema);
  if ('length' in data) {
    // Return new array with ratio instead of rounded_ratio
    return data.map(({ rounded_ratio }) => )
  }

  return { ...data, ratio: data.rounded_ratio }
};
