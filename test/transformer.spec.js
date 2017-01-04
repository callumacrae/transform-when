var mock = document.querySelector('#mock');
var mock2 = document.querySelector('#mock2');
var mocks = document.querySelectorAll('.mock');

describe('Transformer', function () {
	beforeEach(function () {
		mock.removeAttribute('transform');
		scroll(0, 0);
	});

	it('should exist', function () {
		Transformer.should.be.a.Function();
	});

	var transformer;
	it('should init', function () {
		transformer = new Transformer([]);
		transformer.active.should.be.true();
	});

	it('should stop', function () {
		transformer.stop();
		transformer.active.should.be.false();
	});

	it('should change elements by i', function (done) {
		var transformer = new Transformer([
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
			mock.getAttribute('transform').should.containEql('scale(1)');
		}, 40);

		setTimeout(function () {
			mock.getAttribute('transform').should.containEql('scale(2)');
			transformer.stop();
			done();
		}, 120);
	});

	it('should change elements by y', function (done) {
		var transformer = new Transformer([
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
			mock.getAttribute('transform').should.containEql('scale(1)');

			scroll(0, 10);
		}, 20);

		setTimeout(function () {
			mock.getAttribute('transform').should.containEql('scale(2)');
			transformer.stop();
			done();
		}, 40);
	});

	it('should support visible property', function (done) {
		var transformer = new Transformer([
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
				transformer.stop();
				done();
			}, 20);
		}, 20);
	});

	it('should leave original transforms alone', function (done) {
		var transformer = new Transformer([
			{
				el: mock,
				transforms: [
					['scale', function (x, y, i) {
						return (y < 5) ? 1 : 2;
					}]
				]
			}
		]);

		mock.setAttribute('transform', 'translate(100, 200)');

		setTimeout(function () {
			mock.getAttribute('transform').should.containEql('translate(100, 200)');

			scroll(0, 10);
		}, 20);

		setTimeout(function () {
			mock.getAttribute('transform').should.containEql('translate(100, 200)');
			transformer.stop();
			done();
		}, 40);
	});

	it('should support NodeLists', function (done) {
		var transformer = new Transformer([
			{
				el: mocks,
				styles: [
					['opacity', (x, y, i) => {
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
				transformer.stop();
				done();
			}, 20);
		}, 20);
	});
});