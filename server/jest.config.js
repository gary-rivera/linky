const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
	testEnvironment: 'node',
	clearMocks: true,
	preset: 'ts-jest',
	transform: {
		...tsJestTransformCfg,
	},
	setupFilesAfterEnv: ['<rootDir>/singleton.ts'],
};
