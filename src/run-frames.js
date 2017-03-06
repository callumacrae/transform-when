import { transformers } from './Transformer';

// Cache element lookups here so that we don't have to look them up at 60 fps
const elements = {};

/**
 * This function powers transform-when. It is called on requestAnimationFrame,
 * and calls the transform functions.
 */
function runFrames() {
	const scrollPositions = {
		window: {
			x: typeof window.scrollX === 'number' ? window.scrollX : window.pageXOffset,
			y: typeof window.scrollY === 'number' ? window.scrollY : window.pageYOffset,
		},
	};

	// Two loops: the first runs "setup", which calculates all the values to set
	for (let transform of transformers) {
		if (!scrollPositions[transform.scrollElement]) {
			if (!elements[transform.scrollElement]) {
				elements[transform.scrollElement] = document.querySelector(transform.scrollElement);
			}

			scrollPositions[transform.scrollElement] = {
				x: elements[transform.scrollElement].scrollLeft,
				y: elements[transform.scrollElement].scrollTop,
			};
		}

		const position = scrollPositions[transform.scrollElement];

		const vars = { x: position.x, y: position.y };
		Object.keys(transform._customVariables).forEach((varName) => {
			vars[varName] = transform._customVariables[varName].call(transform);
		});

		// This is ugly and I feel bad
		transform._tmpVarCache = vars;

		try {
			transform._setup(vars);
		} catch(e) {
			console.error('Problem during setup', e);
		}
	}

	// The second loop calls "frame", which sets all the previously calculated values
	// It's done in two loops to avoid layout thrashing
	for (let transform of transformers) {
		try {
			transform._frame(transform._tmpVarCache);
		} catch (e) {
			console.error('Problem during frame', e);
		}
	}

	requestAnimationFrame(runFrames);
}
requestAnimationFrame(runFrames);