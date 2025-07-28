import { describe, test, expect, beforeEach } from '@jest/globals';
import { MockContext, Context, createMockContext } from '../context';
import { healthCheck } from '../src/routes/health'; // adjust path

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
	mockCtx = createMockContext();
	ctx = mockCtx as unknown as Context;
});

describe('Health Check', () => {
	test('should return healthy when database connection works', async () => {
		// Mock successful database connection
		mockCtx.prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

		const result = await healthCheck(ctx);

		expect(result).toEqual({
			status: 'healthy',
			database: 'connected',
		});
		expect(mockCtx.prisma.$queryRaw).toHaveBeenCalledWith`SELECT 1`;
	});

	test('should return unhealthy when database connection fails', async () => {
		// Mock database connection failure
		mockCtx.prisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));

		const result = await healthCheck(ctx);

		expect(result).toEqual({
			status: 'unhealthy',
			database: 'disconnected',
			error: 'Connection failed',
		});
	});
});
