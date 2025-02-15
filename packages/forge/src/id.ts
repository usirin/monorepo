import baseX from "base-x";

const base58 = baseX("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");

/**
 * epoch starts more recently so that the 32-bit number space gives a
 * significantly higher useful lifetime of around 136 years
 * from 2023-11-14T22:13:20.000Z to 2159-12-22T04:41:36.000Z.
 */
const EPOCH_TIMESTAMP = 1_700_000_000_000;

/**
 * Generates a unique id using base58 encoding
 */
export function b58() {
	const buf = new Uint8Array(20);
	crypto.getRandomValues(buf);

	const t = Date.now() - EPOCH_TIMESTAMP;

	buf[0] = (t >>> 24) & 255;
	buf[1] = (t >>> 16) & 255;
	buf[2] = (t >>> 8) & 255;
	buf[3] = t & 255;

	return base58.encode(buf);
}
