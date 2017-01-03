var mock = document.querySelector('#mock');

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
});