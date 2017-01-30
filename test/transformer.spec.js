var mock = document.querySelector('#mock');
var mock2 = document.querySelector('#mock2');
var mocks = document.querySelectorAll('.mock');
var svgMock = document.querySelector('#svg-mock');
var scrollableEl = document.querySelector('.scrollable-outer');

describe('Transformer', function () {
	var interval;
	var transformer;

	beforeEach(function () {
		mock.removeAttribute('transform');
		mock.style.transform = 'none';
		svgMock.removeAttribute('transform');
		scroll(0, 0);
		scrollableEl.scrollTop = 0;
	});

	afterEach(function () {
		clearInterval(interval);
		if (transformer) {
			transformer.reset();
		}
	});

	it('should exist', function () {
		Transformer.should.be.a.Function();
	});

	it('should init', function () {
		transformer = new Transformer([]);
		transformer.active.should.be.true();
	});

	it('should stop', function () {
		transformer.stop();
		transformer.active.should.be.false();
	});

	it('should change elements by i', function (done) {
		transformer = new Transformer([
			{
				el: mock,
				transforms: [
					['scale', function (x, y, i) {
						return (i < 3) ? 1 : 2;
					}]
				]
			}
		]);

		interval = setInterval(function () {
			if (mock.style.transform === 'scale(1)') {
				clearInterval(interval);

				interval = setInterval(function () {
					if (mock.style.transform === 'scale(2)') {
						clearInterval(interval);
						done();
					}
				}, 20);
			}
		}, 20);
	});

	it('should change elements by y', function (done) {
		transformer = new Transformer([
			{
				el: mock,
				transforms: [
					['scale', function (x, y, i) {
						return (y < 5) ? 1 : 2;
					}]
				]
			}
		]);

		interval = setInterval(function () {
			if (mock.style.transform === 'scale(1)') {
				scroll(0, 10);
				clearInterval(interval);

				interval = setInterval(function () {
					if (mock.style.transform === 'scale(2)') {
						clearInterval(interval);
						done();
					}
				}, 20);
			}
		}, 20);
	});

	it('should support visible property', function (done) {
		transformer = new Transformer([
			{
				el: mock,
				visible: [0, 10]
			}
		]);

		scroll(0, 20);

		interval = setInterval(function () {
			if (getComputedStyle(mock).display === 'none') {
				scroll(0, 0);
				clearInterval(interval);

				interval = setInterval(function () {
					if (getComputedStyle(mock).display === 'block') {
						clearInterval(interval);
						done();
					}
				}, 20);
			}
		}, 20);
	});

	it('should support global visible method', function (done) {
		transformer = new Transformer([
			{
				el: mock,
			}
		]);

		transformer.setVisible([0, 10]);

		scroll(0, 20);

		interval = setInterval(function () {
			if (getComputedStyle(mock).display === 'none') {
				scroll(0, 0);
				clearInterval(interval);

				interval = setInterval(function () {
					if (getComputedStyle(mock).display === 'block') {
						clearInterval(interval);
						done();
					}
				}, 20);
			}
		}, 20);
	});

	it('should not move display set using css to style attr when toggling visibility', function (done) {
		transformer = new Transformer([
			{
				el: mock,
				visible: [0, 10]
			}
		]);

		scroll(0, 20);

		interval = setInterval(function () {
			if (getComputedStyle(mock).display === 'none') {
				scroll(0, 0);
				clearInterval(interval);

				interval = setInterval(function () {
					if (getComputedStyle(mock).display === 'block') {
						Should(mock.style.display).not.be.ok;
						clearInterval(interval);
						done();
					}
				}, 20);
			}
		}, 20);
	});

	it('should leave original transforms alone', function (done) {
		transformer = new Transformer([
			{
				el: svgMock,
				transforms: [
					['scale', function (x, y, i) {
						return (y < 5) ? 1 : 2;
					}]
				]
			}
		]);

		svgMock.setAttribute('transform', 'translate(100 200)');

		interval = setInterval(function () {
			if (svgMock.getAttribute('transform') === 'translate(100 200) scale(1)') {
				scroll(0, 10);

				clearInterval(interval);

				interval = setInterval(function () {
					if (svgMock.getAttribute('transform') === 'translate(100 200) scale(2)') {
						clearInterval(interval);
						done();
					}
				}, 20);
			}
		}, 20);
	});

	it('should unset transforms on reset', function (done) {
		transformer = new Transformer([
			{
				el: svgMock,
				transforms: [
					['scale', function (x, y, i) {
						return (y < 5) ? 1 : 2;
					}]
				]
			}
		]);

		svgMock.setAttribute('transform', 'translate(100 200)');

		interval = setInterval(function () {
			if (svgMock.getAttribute('transform').indexOf('scale(') !== -1) {
				svgMock.getAttribute('transform').should.containEql('translate(100 200)');

				transformer.reset();

				clearInterval(interval);

				interval = setInterval(function () {
					if (svgMock.getAttribute('transform').indexOf('scale(') === -1) {
						svgMock.getAttribute('transform').should.containEql('translate(100 200)');
						clearInterval(interval);
						done();
					}
				}, 20);
			}
		}, 20);
	});

	it('should support NodeLists', function (done) {
		transformer = new Transformer([
			{
				el: mocks,
				styles: [
					['opacity', function (x, y, i) {
						return (y < 5) ? 1 : 0;
					}]
				]
			}
		]);


		scroll(0, 20);

		interval = setInterval(function () {
			if (getComputedStyle(mock).opacity === '0') {
				getComputedStyle(mock2).opacity.should.equal('0');

				scroll(0, 0);

				clearInterval(interval);

				interval = setInterval(function () {
					if (getComputedStyle(mock).opacity === '1') {
						getComputedStyle(mock2).opacity.should.equal('1');
						clearInterval(interval);
						done();
					}
				}, 20);
			}
		}, 20);
	});

	it('should use attr for SVG transforms', function (done) {
		transformer = new Transformer([
			{
				el: svgMock,
				transforms: [
					['scale', function (x, y, i) {
						return (i < 3) ? 1 : 2;
					}]
				]
			}
		]);

		interval = setInterval(function () {
			if (svgMock.getAttribute('transform').trim() === 'scale(1)') {

				clearInterval(interval);

				interval = setInterval(function () {
					if (svgMock.getAttribute('transform').trim() === 'scale(2)') {
						clearInterval(interval);
						done();
					}
				}, 20);
			}
		}, 20);
	});

	it('should pass in requested arguments only', function (done) {
		var lastY = -1;

		transformer = new Transformer([
			{
				el: mock,
				transforms: [
					['scale', function (y) {
						lastY = y;
						return 1;
					}]
				]
			}
		]);

		scroll(0, 14);

		interval = setInterval(function () {
			if (lastY === 14) {
				clearInterval(interval);
				done();
			}
		}, 20);
	});

	it.skip('should not call fn if request args unchanged', function (done) {
		var called = 0;

		transformer = new Transformer([
			{
				el: mock,
				transforms: [
					['scale', function (y) {
						called++;
						return 1;
					}]
				]
			}
		]);

		scroll(0, 10);

		interval = setInterval(function () {
			if (called === 1) {
				clearInterval(interval);
				scroll(0, 0);

				interval = setInterval(function () {
					if (called === 2) {
						clearInterval(interval);

						setTimeout(function () {
							called.should.equal(2);
							done();
						}, 50);
					}
				}, 20);
			}
		}, 20);
	});

	it('should support getting the scroll position of other elements', function (done) {
		transformer = new Transformer([
			{
				el: mock,
				transforms: [
					['scale', function (x, y, i) {
						return (y < 5) ? 1 : 2;
					}]
				]
			}
		]);

		transformer.scrollElement = '.scrollable-outer';

		interval = setInterval(function () {
			if (mock.style.transform === 'scale(1)') {
				scrollableEl.scrollTop = 10;
				clearInterval(interval);

				interval = setInterval(function () {
					if (mock.style.transform === 'scale(2)') {
						clearInterval(interval);
						done();
					}
				}, 20);
			}
		}, 20);
	});

	it.skip('should not call fn if request args unchanged when using scroll position of other element', function (done) {
		var called = 0;

		transformer = new Transformer([
			{
				el: mock,
				transforms: [
					['scale', function (y) {
						called++;
						return 1;
					}]
				]
			}
		]);

		transformer.scrollElement = '.scrollable-outer';

		scrollableEl.scrollTop = 10;

		interval = setInterval(function () {
			if (called === 1) {
				clearInterval(interval);
				scrollableEl.scrollTop = 0;

				interval = setInterval(function () {
					if (called === 2) {
						clearInterval(interval);

						setTimeout(function () {
							called.should.equal(2);
							done();
						}, 50);
					}
				}, 20);
			}
		}, 20);
	});
});