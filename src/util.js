/**
 * Loops through one or more elements.
 *
 * @param {Element|NodeList} els An element or a NodeList.
 * @param {function} cb Function to call with the element.
 */
export function each(els, cb) {
	if (els instanceof Element) {
		cb(els);
	} else {
		[].slice.call(els).forEach(cb);
	}
}

/**
 * Returns true if transform attribute should be used instead of CSS.
 *
 * @param {Element} el Element to test.
 * @returns {boolean} True if transform attribute should be used.
 */
export function useTransformAttr(el) {
	return (el instanceof SVGElement && el.tagName.toUpperCase() !== 'SVG');
}

// Used by setData and getData.
const dataStore = [];

/**
 * Store data against a given element. IE11 doesn't support dataset on SVG
 * elements, so this is required. It's probably also more performant.
 *
 * @param {Element} el Element to store data against.
 * @param {string} key Key to store data against.
 * @param {*} value Value to store.
 */
export function setData(el, key, value) {
	let elStore = dataStore.find((store) => store.el === el);

	if (!elStore) {
		dataStore.push({
			el,
			data: {},
		});

		elStore = dataStore[dataStore.length - 1];
	}

	elStore.data[key] = value;
}

/**
 * Get data previously stored against a given element.
 *
 * @param {Element} el Element to store data against.
 * @param {string} key Key to store data against.
 * @returns {*} The stored data.
 */
export function getData(el, key) {
	let elStore = dataStore.find((store) => store.el === el);

	if (!elStore) {
		return undefined;
	}

	return elStore.data[key];
}

// Used internally by the smart arguments logic
export const UNCHANGED = Symbol('unchanged');