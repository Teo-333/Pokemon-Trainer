type RawEnv = Record<string, string | undefined>;

export type ValidatedEnv = {
  PORT: number;
  MONGODB_URI: string;
};

const DEFAULT_PORT = 3000;
const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/pokemon_collections';

export function validateEnv(env: RawEnv): ValidatedEnv {
  const port = parsePort(env.PORT);
  const mongodbUri = env.MONGODB_URI ?? DEFAULT_MONGODB_URI;

  if (!mongodbUri.trim()) {
    throw new Error('MONGODB_URI must not be empty');
  }

  if (!mongodbUri.startsWith('mongodb://') && !mongodbUri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must be a valid MongoDB connection string');
  }

  return {
    PORT: port,
    MONGODB_URI: mongodbUri,
  };
}

function parsePort(value: string | undefined): number {
  if (value === undefined || value === '') {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
}
