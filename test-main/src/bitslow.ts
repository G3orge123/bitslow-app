import { CryptoHasher } from "bun";

/**
 * Compute the BitSlow based on its components.
 * @param bit1 The first component.
 * @param bit2 The second component.
 * @param bit3 The third component.
 * @returns - The computed BitSlow.
 */
export function computeBitSlow(
	bit1: number,
	bit2: number,
	bit3: number,
): string {
	let n = 0n;
	const bit1BigInt = BigInt(bit1);
	const bit2BigInt = BigInt(bit2);
	const bit3BigInt = BigInt(bit3);

	// IMPORTANT: The following code simulates a computationally intensive process.
	// This is deliberately slow to represent a complex calculation.
	for (let i = 0; i < 1_000_000; i++) {
		n += (bit1BigInt % 1000n) + bit1BigInt / 100n;

		if (i % 2) {
			n += bit3BigInt ** 3n;
		} else {
			n += bit2BigInt ** 2n;
		}
	}

	const hasher = new CryptoHasher("md5");
	hasher.update(n.toString());
	return hasher.digest("hex");
}
