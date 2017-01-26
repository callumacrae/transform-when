var mock = document.querySelector('#mock');
var mock2 = document.querySelector('#mock2');
var mocks = document.querySelectorAll('.mock');
var svgMock = document.querySelector('#svg-mock');

describe('Transformer', function () {
	var transformer;

	beforeEach(function () {
		mock.removeAttribute('transform');
		mock.style.transform = 'none';
		scroll(0, 0);
	});

	afterEach(function () {
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

		setTimeout(function () {
			mock.style.transform.should.equal('scale(1)');
		}, 40);

		setTimeout(function () {
			mock.style.transform.should.equal('scale(2)');
			done();
		}, 120);
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

		setTimeout(function () {
			mock.style.transform.should.equal('scale(1)');

			scroll(0, 10);
		}, 20);

		setTimeout(function () {
			mock.style.transform.should.equal('scale(2)');
			done();
		}, 40);
	});

	it('should support visible property', function (done) {
		transformer = new Transformer([
			{
				el: mock,
				visible: [0, 10]
			}
		]);

		scroll(0, 20);

		setTimeout(function () {
			getComputedStyle(mock).display.should.equal('none');

			scroll(0, 0);

			setTimeout(function () {
				getComputedStyle(mock).display.should.equal('block');
				done();
			}, 20);
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

		setTimeout(function () {
			getComputedStyle(mock).display.should.equal('none');

			scroll(0, 0);

			setTimeout(function () {
				getComputedStyle(mock).display.should.equal('block');
				done();
			}, 20);
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

		setTimeout(function () {
			getComputedStyle(mock).display.should.equal('none');

			scroll(0, 0);

			setTimeout(function () {
				getComputedStyle(mock).display.should.equal('block');
				Should(mock.style.display).not.be.ok;
				done();
			}, 20);
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

		setTimeout(function () {
			svgMock.getAttribute('transform').should.containEql('scale(1)');
			svgMock.getAttribute('transform').should.containEql('translate(100, 200)');

			scroll(0, 10);
		}, 20);

		setTimeout(function () {
			svgMock.getAttribute('transform').should.containEql('scale(2)');
			svgMock.getAttribute('transform').should.containEql('translate(100, 200)');
			done();
		}, 40);
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

		setTimeout(function () {
			svgMock.getAttribute('transform').should.containEql('scale(');
			svgMock.getAttribute('transform').should.containEql('translate(100, 200)');
			transformer.reset();
		}, 50);

		setTimeout(function () {
			svgMock.getAttribute('transform').should.not.containEql('scale(');
			svgMock.getAttribute('transform').should.containEql('translate(100, 200)');
			done();
		}, 100);
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

		setTimeout(function () {
			getComputedStyle(mock).opacity.should.equal('0');
			getComputedStyle(mock2).opacity.should.equal('0');

			scroll(0, 0);

			setTimeout(function () {
				getComputedStyle(mock).opacity.should.equal('1');
				getComputedStyle(mock2).opacity.should.equal('1');
				done();
			}, 20);
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

		setTimeout(function () {
			svgMock.getAttribute('transform').should.containEql('scale(1)');
		}, 40);

		setTimeout(function () {
			svgMock.getAttribute('transform').should.containEql('scale(2)');
			done();
		}, 120);
	});
});