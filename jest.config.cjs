/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require('ts-jest');
const tsJestCfg = require('./tsconfig.jest.json');

/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jest-environment-jsdom',

	testMatch: ['**/__tests__/**/*.spec.(ts|tsx)'],

	setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],

	transform: {
		'^.+\\.(t|j)sx?$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig.jest.json',
				isolatedModules: false,
				diagnostics: false,
			},
		],
	},

	moduleNameMapper: {
		'^@/dev/constructor/styles/editorBase.css$':
			'<rootDir>/__tests__/mocks/styleStub.js',

		'\\.(css|less|sass|scss)$': '<rootDir>/__tests__/mocks/styleStub.js',

		'\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__tests__/mocks/fileMock.js',

		...pathsToModuleNameMapper(tsJestCfg.compilerOptions.paths || {}, {
			prefix: '<rootDir>/',
		}),
	},

	moduleDirectories: ['node_modules', '<rootDir>', '<rootDir>/src'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

	testPathIgnorePatterns: ['<rootDir>/__tests__/mocks/'],
};
