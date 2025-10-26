import { drizzle } from 'drizzle-orm/neon-http';

// This is a temporary solution to get the build to pass.
// The application will not be able to connect to a real database until the placeholder is replaced with a valid connection string.
const connectionString = "postgresql://user:password@host:port/db?sslmode=require";

export const db = drizzle(connectionString);
