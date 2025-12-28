import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { Test, type TestingModule } from "@nestjs/testing";
import type { ConfigService } from "../../src";
import { ConfigModule, getConfigServiceToken } from "../../src";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectType = "CJS";
const createModule = async (path: string) => {
	return await Test.createTestingModule({
		imports: [
			ConfigModule.forRoot({
				name: "env.config",
				cwd: join(__dirname, path),
			}),
		],
	}).compile();
};

describe(`ConfigModule (${projectType} project)`, () => {
	describe(`${projectType} => ENV config`, () => {
		let module: TestingModule;

		beforeEach(async () => {
			module = await createModule("../fixtures/env");
		});

		afterEach(async () => {
			await module.close();
		});

		it("should be defined", () => {
			assert.ok(module);
		});

		it("should provide ConfigService", () => {
			const configService = module.get<ConfigService>(getConfigServiceToken());
			assert.ok(configService);
		});

		it("should load config values", () => {
			const configService = module.get<ConfigService>(getConfigServiceToken());
			const common = configService.get("common");
			assert.strictEqual(common, "Hello");
		});
	});

	describe(`${projectType} => ESM config`, () => {
		let module: TestingModule;

		beforeEach(async () => {
			module = await createModule("../fixtures/esm");
		});

		afterEach(async () => {
			await module.close();
		});

		it("should be defined", () => {
			assert.ok(module);
		});

		it("should provide ConfigService", () => {
			const configService = module.get<ConfigService>(getConfigServiceToken());
			assert.ok(configService);
		});

		it("should load config values", () => {
			const configService = module.get<ConfigService>(getConfigServiceToken());
			const common = configService.get("common");
			assert.strictEqual(common, "Hello");
		});
	});

	describe(`${projectType} => CJS config`, () => {
		let module: TestingModule;

		beforeEach(async () => {
			module = await createModule("../fixtures/cjs");
		});

		afterEach(async () => {
			await module.close();
		});

		it("should be defined", () => {
			assert.ok(module);
		});

		it("should provide ConfigService", () => {
			const configService = module.get<ConfigService>(getConfigServiceToken());
			assert.ok(configService);
		});

		it("should load config values", () => {
			const configService = module.get<ConfigService>(getConfigServiceToken());
			const common = configService.get("common");
			assert.strictEqual(common, "Hello");
		});
	});

	describe(`${projectType} => TS config`, () => {
		let module: TestingModule;

		beforeEach(async () => {
			module = await createModule("../fixtures/ts");
		});

		afterEach(async () => {
			await module.close();
		});

		it("should be defined", () => {
			assert.ok(module);
		});

		it("should provide ConfigService", () => {
			const configService = module.get<ConfigService>(getConfigServiceToken());
			assert.ok(configService);
		});

		it("should load config values", () => {
			const configService = module.get<ConfigService>(getConfigServiceToken());
			const common = configService.get("common");
			assert.strictEqual(common, "Hello");
		});
	});

	describe(`${projectType} => Missing config`, () => {
		it("should throw error when config is missing and throwError is not specified", async () => {
			await assert.rejects(
				async () => {
					await Test.createTestingModule({
						imports: [
							ConfigModule.forRoot({
								name: "nonexistent.config",
								cwd: join(__dirname, "../fixtures"),
							}),
						],
					}).compile();
				},
				(error: Error) => {
					return error instanceof Error;
				},
				"should throw error when config file is missing",
			);
		});

		it("should not throw error when config is missing and throwError is false", async () => {
			const module = await Test.createTestingModule({
				imports: [
					ConfigModule.forRoot({
						name: "nonexistent.config",
						cwd: join(__dirname, "../fixtures"),
						throwError: false,
					}),
				],
			}).compile();

			assert.ok(module);
			const configService = module.get<ConfigService>(getConfigServiceToken());
			assert.ok(configService);

			await module.close();
		});
	});
});
