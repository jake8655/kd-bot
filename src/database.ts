import mysql, { type Connection } from "mysql";
import util from "util";
import { env } from "./env/env";

export const connect = () => {
  const connection = mysql.createConnection({
    host: env.DATABASE_HOST,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
  });

  connection.connect((err) => {
    if (err) {
      console.error("error connecting: " + err.stack);
      return;
    }

    console.log("connected as id " + connection.threadId);
  });

  return connection;
};

export const createQuery = (connection: Connection) => {
  return util.promisify(connection.query).bind(connection);
};
