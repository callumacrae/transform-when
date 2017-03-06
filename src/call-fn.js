import { UNCHANGED } from './util';

// An object containing common useful roundings
export const dps = {
	'transforms:rotate': 1,
	'transforms:scale': 3,
	'transforms:translate': 1,
	'styles:opacity': 2
};

/**
 * A utility function to call the transform function of a transformer. Handles
 * stuff like smart arguments, and calculating whether to call the function in
 * the first place.
 *
 * This is a utility function, but it's long enough for its own file.
 */
export default function callFn(type, name, fn, transform, unit, args) {
	let isFirstCall = !fn.args;

	if (isFirstCall) {
		// Smart arguments: calculate the arguments to be passed to the transform
		// function. Either an array (`['x', 'y', ()=>{}}`) or a fn (`(x, y)=>{}`).
		if (typeof fn === 'function') {
			fn.args = fn.toString().match(/\((.*?)\)/)[1].split(',').map((str) => str.trim());
		} else {
			fn.args = fn.slice(0, -1);
		}
	}

	let changed = isFirstCall;

	if (fn.args.includes('i')) {
		changed = true;
	}

	if (fn.args.includes('actions') && (Object.keys(args.actions).length || args.actionEnded)) {
		changed = true;
	}

	if (!changed) {
		changed = Object.keys(args.last).some((arg) => {
			return fn.args.includes(arg) && args[arg] !== args.last[arg];
		});
	}

	// If the arguments haven't changed, don't call the function because the
	// value won't have changed. This assumes that functions are pure: request
	// the `i` argument if it isn't.
	if (!changed) {
		return UNCHANGED;
	}

	const argsForFn = fn.args.map((arg) => args[arg]);
	const callableFn = typeof fn === 'function' ? fn : fn[fn.length - 1];
	let val = callableFn.apply(transform, argsForFn);

	// Round returned value for extra performance
	if (typeof val === 'number') {
		let roundTo = dps[type + ':' + (Array.isArray(name) ? name[0] : name)];
		if (typeof roundTo !== 'number') {
			roundTo = 3;
		}

		val = Math.round(val * Math.pow(10, roundTo)) / Math.pow(10, roundTo);
	}

	return val + unit;
}