export default function Transformer(transforms) {
	this.i = 0;
	this.transforms = transforms;
	this.visible = undefined;

	this._lastX = -1;
	this._lastY = -1;

	this.start();
}

Transformer.prototype.stop = function stopTransforms() {
	this.active = false;
};

Transformer.prototype.start = function startTransforms() {
	this.active = true;
	requestAnimationFrame(this._frame.bind(this));
};

Transformer.prototype.reset = function resetTransforms() {
	this.stop();

	for (let transform of this.transforms) {
		if (transform.transforms) {
			each(transform.el, (el) => {
				if (useTransformAttr(el)) {
					el.setAttribute('transform', getData(el, 'originalTransform'));
				} else {
					el.style.transform = getData(el, 'originalTransform');
				}
			});
		}

		if (transform.visible || this.visible) {
			each(transform.el, (el) => {
				el.style.display = getData(el, 'originalDisplay');
			});
		}

		// @todo: should styles be unset?
		// if (transform.styles) {
		// 	for (let [ style, fn, unit = '' ] of transform.styles) {
		// 		each(transform.el, (el) => {
		// 			el.style[style] = '';
		// 		});
		// 	}
		// }

		// @todo: should attrs be unset?
		// if (transform.attrs) {
		// 	for (let [ attr, fn, unit = '' ] of transform.attrs) {
		// 		each(transform.el, (el) => el.removeAttribute(attr));
		// 	}
		// }
	}
};

Transformer.prototype.setVisible = function setGlobalVisible(visible) {
	this.visible = visible;
};

Transformer.prototype._frame = function transformFrame() {
	if (!this.active) {
		return;
	}

	const x = typeof window.scrollX === 'number' ? window.scrollX : window.pageXOffset;
	const y = typeof window.scrollY === 'number' ? window.scrollY : window.pageYOffset;

	for (let transform of this.transforms) {
		// Has to run before visible check
		if (transform.transforms && this.i === 0) {
			each(transform.el, (el) => {
				if (useTransformAttr(el)) {
					setData(el, 'originalTransform', (el.getAttribute('transform') || '') + ' ');
				} else {
					const original = el.style.transform;
					setData(el, 'originalTransform', !original || original === 'none' ? '' : `${original} `);
				}
			});
		}

		if (transform.visible || this.visible) {
			let isHidden = true;
			if (this.visible) {
				isHidden = y < this.visible[0] || y > this.visible[1];
			}

			if (isHidden && transform.visible) {
				isHidden = y < transform.visible[0] || y > transform.visible[1];
			}

			if (isHidden) {
				each(transform.el, (el) => {
					if (typeof getData(el, 'originalDisplay') === 'undefined') {
						setData(el, 'originalDisplay', el.style.display || '');
					}

					el.style.display = 'none';
				});

				continue;
			} else {
				each(transform.el, (el) => {
					el.style.display = getData(el, 'originalDisplay');
				});
			}
		}

		const args = { x, y, i: this.i, lastX: this._lastX, lastY: this._lastY };

		if (transform.transforms) {
			const transforms = transform.transforms
				.map(([ prop, fn, unit = '' ]) => `${prop}(${callFn('transforms', prop, fn, transform, unit, args)})`)
				.join(' ');

			each(transform.el, (el) => {
				if (useTransformAttr(el)) {
					el.setAttribute('transform', getData(el, 'originalTransform') + transforms);
				} else {
					el.style.transform = getData(el, 'originalTransform') + transforms;
				}
			});
		}

		if (transform.styles) {
			for (let [ style, fn, unit = '' ] of transform.styles) {
				const computed = callFn('styles', style, fn, transform, unit, args);

				if (computed === Transformer.UNCHANGED) {
					continue;
				}

				each(transform.el, (el) => {
					el.style[style] = computed;
				});
			}
		}

		if (transform.attrs) {
			for (let [ attr, fn, unit = '' ] of transform.attrs) {
				const computed = callFn('attrs', attr, fn, transform, unit, args);

				if (computed === Transformer.UNCHANGED) {
					continue;
				}

				each(transform.el, (el) => el.setAttribute(attr, computed));
			}
		}
	}

	this.i++;
	this._lastX = x;
	this._lastY = y;

	requestAnimationFrame(this._frame.bind(this));
};

Transformer.UNCHANGED = Symbol('unchanged');

function callFn(type, name, fn, transform, unit, args) {
	const dps = {
		'transforms:rotate': 1,
		'transforms:scale': 3,
		'transforms:translate': 1,
		'styles:opacity': 2
	};

	if (!fn.args) {
		fn.args = fn.toString().match(/\((.*?)\)/)[1].split(',').map((str) => str.trim());
	}

	// @todo: Figure out how to do this for transforms
	if (type !== 'transforms') {
		let changed = false;

		if (fn.args.includes('i')) {
			changed = true;
		}

		if (fn.args.includes('x') && args.x !== args.lastX) {
			changed = true;
		}

		if (fn.args.includes('y') && args.y !== args.lastY) {
			changed = true;
		}

		if (!changed) {
			return Transformer.UNCHANGED;
		}
	}

	const argsForFn = fn.args.map((arg) => args[arg]);
	let val = fn.apply(transform, argsForFn);

	if (typeof val === 'number') {
		const roundTo = typeof dps[type + ':' + name] === 'number' ? dps[type + ':' + name] : 3;

		val = Math.round(val * Math.pow(10, roundTo)) / Math.pow(10, roundTo);
	}

	return val + unit;
}

Transformer.transform = function transformValue(domain, range, val, fixed) {
	if (typeof val === 'undefined') {
		return (val2) => Transformer.transform(domain, range, val2, fixed);
	}

	let normalised = (val - domain[0]) / (domain[1] - domain[0]);

	if (fixed !== false) {
		normalised = Math.min(Math.max(normalised, 0), 1);
	}

	return (range[1] - range[0]) * normalised + range[0];
};

// Send your PRs!
Transformer.easings = {
	linear: (x) => x,
	jump: (x) => x < 0.5 ? 2 * x * (1 - x) : 2 * Math.pow(x, 2) - 2 * x + 1
};

Transformer.transformObj = function transformObj(obj, loopBy, easing) {
	const keys = Object.keys(obj).sort((a, b) => a - b);
	const keysBackwards = keys.slice().reverse();

	if (typeof easing === 'string') {
		easing = Transformer.easings[easing];
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
		return Transformer.transform([Number(from), Number(to)], [obj[from], toVal], val);
	};
};

function each(els, cb) {
	if (els instanceof Element) {
		cb(els);
	} else {
		[].slice.call(els).forEach(cb);
	}
}

function useTransformAttr(el) {
	return (el instanceof SVGElement && el.tagName.toUpperCase() !== 'SVG');
}

const dataStore = [];
function setData(el, key, value) {
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

function getData(el, key) {
	let elStore = dataStore.find((store) => store.el === el);

	if (!elStore) {
		return undefined;
	}

	return elStore.data[key];
}