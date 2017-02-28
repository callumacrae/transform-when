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

	it('should not call transform functions if element hidden', function (done) {
		var called = 0;

		transformer = new Transformer([
			{
				el: mock,
				visible: [0, 10],
				styles: [['opacity', function (i) {
					called++;
				}]],
				attrs: [['opacity', function (i) {
					called++;
				}]],
			}
		]);

		scroll(0, 20);

		interval = setInterval(function () {
			if (getComputedStyle(mock).display === 'none') {
				called.should.equal(0);

				clearInterval(interval);
				done();
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

	it('should pass in requested arguments only (minified)', function (done) {
		var lastY = -1;

		transformer = new Transformer([
			{
				el: mock,
				transforms: [
					['scale', ['y', function (a) {
						lastY = a;
						return 1;
					}]]
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

	it('should not call fn if request args unchanged', function (done) {
		var called = 0;

		transformer = new Transformer([
			{
				el: mock,
				attrs: [
					['data-test', function (y) {
						called++;
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

	it('should call fn once if no arguments', function (done) {
		var called = 0;

		transformer = new Transformer([
			{
				el: mock,
				attrs: [
					['data-test', function () {
						called++;
					}]
				]
			}
		]);

		scroll(0, 10);

		interval = setInterval(function () {
			if (called === 1) {
				clearInterval(interval);
				scroll(0, 0);

				setTimeout(function () {
					called.should.equal(1);
					done();
				}, 50);
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

	it('should not call fn if request args unchanged when using scroll position of other element', function (done) {
		var called = 0;

		transformer = new Transformer([
			{
				el: mock,
				attrs: [
					['data-test', function (y) {
						called++;
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

	it('should support changing multiple css styles at once', function (done) {
		transformer = new Transformer([
			{
				el: mock,
				styles: [
					[['clip-path', 'webkit-clip-path'], function (i) {
						return 'circle(50px at 0% 100px)';
					}]
				]
			}
		]);

		interval = setInterval(function () {
			if (mock.style.clipPath.startsWith('circle(50px at') ||
				(mock.style['webkit-clip-path'] && mock.style['webkit-clip-path'].startsWith('circle(50px at'))) {
				clearInterval(interval);
				done();
			}
		}, 20);
	});

	describe('actions and triggers', function () {
		it('should support triggering actions', function (done) {
			var lastActions;
			var called = 0;

			transformer = new Transformer([
				{
					el: mock,
					styles: [
						['opacity', function (actions) {
							lastActions = actions;
							called++;
						}]
					]
				}
			]);

			interval = setInterval(function () {
				if (called === 1) {
					clearInterval(interval);

					lastActions.should.not.have.property('test');

					transformer.trigger('test', 100);

					var lastVal = 0;

					interval = setInterval(function () {
						if (lastActions.test === 1) {
							done();
							clearInterval(interval);
							return;
						}

						lastActions.test.should.be.a.Number();
						lastActions.test.should.not.be.below(lastVal);
						lastActions.test.should.be.within(0, 1);

						lastVal = lastActions.test;
					}, 20);
				}
			});
		});

		it('should support smart arguments and not be called when not needed', function (done) {
			var lastActions;
			var called = 0;

			transformer = new Transformer([
				{
					el: mock,
					styles: [
						['opacity', function (actions) {
							lastActions = actions;
							called++;
						}]
					]
				}
			]);

			interval = setInterval(function () {
				if (called === 1) {
					clearInterval(interval);

					transformer.trigger('test', 30);

					interval = setInterval(function () {
						if (lastActions.test === 1) {
							clearInterval(interval);

							called.should.be.above(2);
							var calledNow = called;

							setTimeout(function () {
								// Called should not have increased
								called.should.equal(calledNow);
								done();
							}, 30);
						}
					}, 20);
				}
			});
		});

		it('should allow multiple actions to be called at once', function (done) {
			var lastActions;

			transformer = new Transformer([
				{
					el: mock,
					styles: [
						['opacity', function (actions) {
							lastActions = actions;
						}]
					]
				}
			]);

			transformer.trigger('test', 60);
			transformer.trigger('test2', 120);

			interval = setInterval(function () {
				lastActions.should.have.property('test2');

				if (lastActions.test < 1) {
					lastActions.test.should.be.approximately(lastActions.test2 * 2, 0.05);
				} else {
					lastActions.test2.should.be.above(0.4999);
					clearInterval(interval);
					done();
				}
			}, 20);
		});

		it('should return a promise that resolves when action complete', function () {
			transformer = new Transformer([]);

			const start = Date.now();

			return transformer.trigger('test', 60)
				.then(function () {
					(Date.now() - start).should.be.approximately(60, 30);
				});
		});

		it('should return nothing if window.Promise undefined', function () {
			const Promise = window.Promise;
			window.Promise = undefined;

			// This so that if the test fails, it doesn't break anything else
			setTimeout(function () {
				window.Promise = Promise;
			});

			transformer = new Transformer([]);

			Should(transformer.trigger('test', 60)).equal(undefined);

			window.Promise = Promise;
		});
	});

	describe('change detection', function () {
		it('should not write transform changes to DOM if transforms haven\'t changed', function (done) {
			let called = 0;

			const transformPart = {
				el: mock,
				transforms: [
					['scale', function (i) {
						called++;
						return 1;
					}]
				]
			};

			transformer = new Transformer([ transformPart ]);

			interval = setInterval(function () {
				if (called === 1) {
					transformPart._stagedData.transforms.should.equal('scale(1)');
				}

				if (called > 1) {
					transformPart._stagedData.transforms.should.have.type('symbol');
					clearInterval(interval);
					done();
				}
			}, 5);
		});

		it('should not write style changes to DOM if style hasn\'t changed', function (done) {
			let called = 0;

			const transformPart = {
				el: mock,
				styles: [
					['opacity', function (i) {
						called++;
						return 1;
					}]
				]
			};

			transformer = new Transformer([ transformPart ]);

			interval = setInterval(function () {
				if (called === 1) {
					transformPart._stagedData.styles.opacity.should.equal('1');
				}

				if (called > 1) {
					transformPart._stagedData.styles.opacity.should.have.type('symbol');
					clearInterval(interval);
					done();
				}
			}, 5);
		});

		it('should not write attr changes to DOM if they haven\'t changed', function (done) {
			let called = 0;

			const transformPart = {
				el: mock,
				attrs: [
					['data-test', function (i) {
						called++;
						return 'foo';
					}]
				]
			};

			transformer = new Transformer([ transformPart ]);

			interval = setInterval(function () {
				if (called === 1) {
					transformPart._stagedData.attrs['data-test'].should.equal('foo');
				}

				if (called > 1) {
					transformPart._stagedData.attrs['data-test'].should.have.type('symbol');
					clearInterval(interval);
					done();
				}
			}, 5);
		});
	});
});