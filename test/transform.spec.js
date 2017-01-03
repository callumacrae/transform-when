describe('Transformer.transform()', function () {
	it('should exist', function () {
		Should(Transformer.transform).be.a.Function();
	});

	it('should transform numbers', function () {
		Transformer.transform([400, 600], [1, 0], 400).should.equal(1);
		Transformer.transform([400, 600], [1, 0], 500).should.equal(0.5);
		Transformer.transform([400, 600], [1, 0], 600).should.equal(0);
	});

	it('should transform numbers out of the bounds', function () {
		Transformer.transform([400, 600], [1, 0], 300).should.equal(1);
		Transformer.transform([400, 600], [1, 0], 700).should.equal(0);
	});

	it('should transform numbers out of the bounds when fixed=false', function () {
		Transformer.transform([400, 600], [1, 0], 300, false).should.equal(1.5);
		Transformer.transform([400, 600], [1, 0], 400, false).should.equal(1);
		Transformer.transform([400, 600], [1, 0], 500, false).should.equal(0.5);
		Transformer.transform([400, 600], [1, 0], 600, false).should.equal(0);
		Transformer.transform([400, 600], [1, 0], 700, false).should.equal(-0.5);
	});

	it('should return a function when value not specified', function () {
		var transformFn = Transformer.transform([400, 600], [1, 0]);

		Should(transformFn).be.a.Function();

		transformFn(400).should.equal(1);
		transformFn(500).should.equal(0.5);
		transformFn(600).should.equal(0);
	});
});
