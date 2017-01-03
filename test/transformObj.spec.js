describe('Transformer.transformObj()', function () {
	it('should exist', function () {
		Should(Transformer.transformObj).be.a.Function();
	});

	it('should transform numbers', function () {
		var transformFn = Transformer.transformObj({
			4: 0,
			6: 0.5,
			8: 0.5,
			10: 1
		});

		Should(transformFn).be.a.Function();

		transformFn(3).should.equal(0);
		transformFn(4).should.equal(0);
		transformFn(5).should.equal(0.25);
		transformFn(6).should.equal(0.5);
		transformFn(7).should.equal(0.5);
		transformFn(8).should.equal(0.5);
		transformFn(9).should.equal(0.75);
		transformFn(10).should.equal(1);
		transformFn(11).should.equal(1);
	});

	it('should loopBy', function () {
		var transformFn = Transformer.transformObj({
			0: 0,
			1: 50,
			2: 50,
			3: 100
		}, 4);

		Should(transformFn).be.a.Function();

		transformFn(0).should.equal(0);
		transformFn(1).should.equal(50);
		transformFn(2).should.equal(50);
		transformFn(3).should.equal(100);
		transformFn(3.5).should.equal(50);
		transformFn(4).should.equal(0);
		transformFn(5.5).should.equal(50);
		transformFn(6.75).should.equal(87.5);
	});

	it('should support easing functions', function () {
		var ease = function (x) {
			return x * x;
		};

		var transformFn = Transformer.transformObj({
			0: 0,
			1: 50,
			2: 50,
			3: 100
		}, 4, ease);

		Should(transformFn).be.a.Function();

		transformFn(0).should.equal(0);
		transformFn(0.5).should.equal(3.125);
		transformFn(1).should.equal(12.5);
		transformFn(2).should.equal(50);
		transformFn(2.5).should.equal(50);
		transformFn(3).should.equal(62.5);
		transformFn(3.5).should.equal(93.75);
		transformFn(3.75).should.equal(48.4375);
		transformFn(4).should.equal(0);
	});
});
