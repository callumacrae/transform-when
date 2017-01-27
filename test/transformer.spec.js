var mock = document.querySelector('#mock');
var mock2 = document.querySelector('#mock2');
var mocks = document.querySelectorAll('.mock');
var svgMock = document.querySelector('#svg-mock');

describe('Transformer', function () {
	var interval;
	var transformer;

	beforeEach(function () {
		mock.removeAttribute('transform');
		mock.style.transform = 'none';
		svgMock.removeAttribute('transform');
		scroll(0, 0);
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

		svgMock.setAttribute('transform', 'translate(100, 200)');

		interval = setInterval(function () {
			if (svgMock.getAttribute('transform') === 'translate(100, 200) scale(1)') {
				scroll(0, 10);

				clearInterval(interval);

				interval = setInterval(function () {
					if (svgMock.getAttribute('transform') === 'translate(100, 200) scale(2)') {
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

		svgMock.setAttribute('transform', 'translate(100, 200)');

		interval = setInterval(function () {
			if (svgMock.getAttribute('transform').indexOf('scale(') !== -1) {
				svgMock.getAttribute('transform').should.containEql('translate(100, 200)');

				transformer.reset();

				clearInterval(interval);

				interval = setInterval(function () {
					if (svgMock.getAttribute('transform').indexOf('scale(') === -1) {
						svgMock.getAttribute('transform').should.containEql('translate(100, 200)');
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
});