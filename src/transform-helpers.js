/**
 * Given a domain and a range, transforms a number into another number.
 *
 * See the README.
 *
 * @param {[number, number]} domain 2-dimensional domain.
 * @param {[number, number]} range 2-dimensional range.
 * @param {number} [val] The number to transform.
 * @param {boolean} [fixed=true] Restrict the number to the range.
 * @returns {number|function} Transformed number.
 */
export function transform(domain, range, val, fixed) {
	if (typeof val === 'undefined') {
		return (val2) => transform(domain, range, val2, fixed);
	}

	let normalised = (val - domain[0]) / (domain[1] - domain[0]);

	if (fixed !== false) {
		normalised = Math.min(Math.max(normalised, 0), 1);
	}

	return (range[1] - range[0]) * normalised + range[0];
}

// Easings that can be used by transdformObj. Each function should take a
// number between 0 and 1 (a percentage) and return a different number between
// 0 and 1. Feel free to send PRs.
export const easings = {
	linear: (x) => x,
	jump: (x) => x < 0.5 ? 2 * x * (1 - x) : 2 * Math.pow(x, 2) - 2 * x + 1
};

/**
 * Given an object to transform by, transforms a number into another number.
 *
 * See the README.
 *
 * @param {object} obj The object containing the values to transform around.
 * @param {number} [loopBy] The number to restart the transform at.
 * @param {string|function} [easing] Easing function.
 * @returns {Function} Function that takes a number to transform.
 */
export function transformObj(obj, loopBy, easing) {
	const keys = Object.keys(obj).sort((a, b) => a - b);
	const keysBackwards = keys.slice().reverse();

	if (typeof easing === 'string') {
		easing = easings[easing];
	}

	return function (val) {
		if (loopBy && typeof easing === 'function') {
			val = easing((val % loopBy) / loopBy) * loopBy;
		} else if (loopBy) {
			val %= loopBy;
		}

		if (val <= keys[0]) {
			return obj[keys[0]];
		}

		if (val >= keysBackwards[0] && !loopBy) {
			return obj[keysBackwards[0]];
		}

		const fromIndex = keys.length - 1 - keysBackwards.findIndex((key) => (val >= key));

		const from = keys[fromIndex];
		const to = keys[fromIndex + 1] || loopBy;

		const toVal = to === loopBy ? obj[keys[0]] : obj[to];
		return transform([Number(from), Number(to)], [obj[from], toVal], val);
	};
}