import { describe, expect, it } from "bun:test";
import { computeBitSlow } from "../src/bitslow";

describe("BitSlow", () => {
	it("should compute consistent hash for the same inputs", () => {
		const result1: string = computeBitSlow(123, 456, 789);
		const result2: string = computeBitSlow(123, 456, 789);
		expect(result1).toEqual(result2);
	});

	it("should produce different hashes for different inputs", () => {
		const result1: string = computeBitSlow(123, 456, 789);
		const result2: string = computeBitSlow(789, 456, 123);
		expect(result1).not.toEqual(result2);
	});

	it("should handle zero values", () => {
		// Should run without errors
		const result: string = computeBitSlow(0, 0, 0);
		// Result should be a string with 32 characters (MD5 hash in hex is 32 chars)
		expect(typeof result).toBe("string");
		expect(result.length).toBe(32);
	});
});
