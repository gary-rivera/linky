const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedInit() {
	console.log('[Prisma][seed] Planting seeds...');

	const hashedPassword = await bcrypt.hash('password123', 10);
	const [user1, user2] = await Promise.all([
		createUserWithPassword('john@test.com', hashedPassword),
		createUserWithPassword('jane@test.com', hashedPassword),
	]);

	const urls = await Promise.all([
		prisma.shortenedUrl.upsert({
			where: { slug: 'google' },
			update: {},
			create: {
				original_url: 'https://www.google.com',
				slug: 'google',
				user_id: user1.id,
				visit_count: 5,
			},
		}),
		prisma.shortenedUrl.upsert({
			where: { slug: 'github' },
			update: {},
			create: {
				original_url: 'https://www.github.com',
				slug: 'github',
				user_id: user2.id,
				visit_count: 12,
			},
		}),
		prisma.shortenedUrl.upsert({
			where: { slug: 'amazon' },
			update: {},
			create: {
				original_url: 'https://www.amazon.com',
				slug: 'amazon',
				user_id: null, // anon
				visit_count: 3,
			},
		}),
	]);

	await prisma.visit.createMany({
		data: [
			{
				shortened_url_id: urls[0].id,
				ip_address: '192.168.1.1',
				user_agent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			},
			{
				shortened_url_id: urls[1].id,
				ip_address: '10.0.0.1',
				user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
			},
		],
		skipDuplicates: true,
	});

	console.log('[Prisma][seed] Seed Completed. Results:\n', {
		user1,
		user2,
		urls,
	});
}

const createUserWithPassword = async (email, password_hash) =>
	prisma.user.upsert({
		where: { email },
		update: {},
		create: {
			email,
			password_hash,
		},
	});

seedInit()
	.catch((err) => {
		console.error('Seed failed: ', err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
