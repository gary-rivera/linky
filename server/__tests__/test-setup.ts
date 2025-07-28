import { jest } from '@jest/globals';
import 'dotenv/config';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'your-test-db-url';

jest.setTimeout(10000);
