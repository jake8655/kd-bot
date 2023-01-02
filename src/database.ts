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

export const queryDb = util.promisify(connection.query).bind(connection);

export const safeQuery = async <T extends z.ZodRawShape>(
  query: string,
  schema: z.ZodObject<T>
) => {
  const res = await queryDb(query);

  try {
    const row = z.array(schema).parse(res);
    return row;
  } catch {
    console.warn(`❌ Parsing query failed: ${query}`);
    throw new Error('Parsing query failed');
  }
};

export const getLeaderboard = async () => {
  const TOP = 50;
  const ORDER_BY = 'rounded_ratio';
  const query = `select
    cast(ratio as decimal(10, 2)) as rounded_ratio,
    kd.*, users.name from kd
    left join users on kd.identifier = users.identifier
    order by ${ORDER_BY} desc limit ${TOP}`;

  const data = await safeQuery(
    query,
    z.object({
      kills: z.number(),
      deaths: z.number(),
      rounded_ratio: z.number(),
      name: z
        .string()
        .nullish()
        .transform(name => {
          if (!name) return 'Anonymous';
          return name.trim();
        }),
    })
  );

  return data.map(({ rounded_ratio, ...rest }) => ({
    ratio: rounded_ratio,
    ...rest,
  }));
};
