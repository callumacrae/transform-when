export default function Transformer(transforms) {
	this.i = 0;
	this.transforms = transforms;

	this.start();
}

Transformer.prototype.stop = function stopTransforms() {
	this.active = false;
};

Transformer.prototype.start = function startTransforms() {
	this.active = true;
	requestAnimationFrame(this._frame.bind(this));
};

Transformer.prototype._frame = function transformFrame() {
	if (!this.active) {
		return;
	}

	const x = window.scrollX;
	const y = window.scrollY;

	for (let transform of this.transforms) {
		// Has to run before visible check
		if (transform.transforms && this.i === 0) {
			transform.el.dataset._originalTransform = (transform.el.getAttribute('transform') || '') + ' ';
		}

		if (transform.visible) {
			if (y < transform.visible[0] || y > transform.visible[1]) {
				if (!transform.el.dataset._originalDisplay) {
					transform.el.dataset._originalDisplay = getComputedStyle(transform.el).display;
				}

				transform.el.style.display = 'none';

				continue;
			} else {
				transform.el.style.display = transform.el.dataset._originalDisplay || 'inline';
			}
		}

		const args = [x, y, this.i];

		if (transform.transforms) {
			const transforms = transform.transforms
				.map(([ prop, fn, unit = '' ]) => `${prop}(${callFn('transforms', prop, fn, transform, unit, args)})`)
				.join(' ');

			transform.el.setAttribute('transform', transform.el.dataset._originalTransform + transforms);
		}

		if (transform.styles) {
			for (let [ style, fn, unit = '' ] of transform.styles) {
				transform.el.style[style] = callFn('styles', style, fn, transform, unit, args);
			}
		}

		if (transform.attrs) {
			for (let [ attr, fn, unit = '' ] of transform.attrs) {
				transform.el.setAttribute(attr, callFn('attrs', attr, fn, transform, unit, args));
			}
		}
	}

	this.i++;

	requestAnimationFrame(this._frame.bind(this));
};

function callFn(type, name, fn, transform, unit, args) {
	const dps = {
		'transforms:rotate': 1,
		'transforms:scale': 3,
		'transforms:translate': 1,
		'styles:opacity': 2
	};

	let val = fn.apply(transform, args);

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
	const keys = Object.keys(obj);
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