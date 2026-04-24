import 'dotenv/config'
import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './schema'

function parseConnectionString(url: string) {
  const prefix = 'postgresql://'
  const rest = url.slice(prefix.length)

  const atLastIndex = rest.lastIndexOf('@')
  const userPass = rest.slice(0, atLastIndex)
  const hostAndDb = rest.slice(atLastIndex + 1)

  const colonIndex = userPass.indexOf(':')
  const user = userPass.slice(0, colonIndex)
  const password = userPass.slice(colonIndex + 1)

  const [hostPort, database] = hostAndDb.split('/')
  const [host, port] = hostPort.split(':')

  return { user, password, host, port: Number(port), database }
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in .env')
}

const config = parseConnectionString(connectionString)

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    ...config,
    max: 10,
    ssl: { rejectUnauthorized: false },
  })
})

export const db = new Kysely<Database>({
  dialect,
})