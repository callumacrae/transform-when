# transform-when [![Build Status](https://travis-ci.org/SamKnows/transform-when.svg?branch=master)](https://travis-ci.org/SamKnows/transform-when)

> A library for handing animations combining page position and time, written at [SamKnows].

## Installation

```
$ npm install --save transform-when
```

## Usage

```js
const Transformer = require('transform-when');

const transforms = new Transformer([
  {
    el: document.querySelector('.my-element'),
    visible: [0, 600],
    transform: [
      ['scale', (x, y, i) => Transformer.transform([400, 600], [1, 0.5], y)]
    ],
    opacityTransform: Transformer.transformObject({
      0: 0.5,
      100: 1,
      400: 1,
      600: 0
    }),
    styles: [
      ['opacity', function (x, y, i) {
        return this.opacityTransform(y);
      }]
    ],
    attrs: []
  },
  {
    el: document.querySelector('.my-other-element'),
    // ...
  }
]);

button.addEventListener('click', function () {
  transforms.stop();
});
```

A _lot_ happened in that code sample, so let's break it down a bit:

The `Transformer` constructor function takes an array of **transforms**. Each
transform corresponds to one element, and allows you to change any property
about that element: CSS properties with `styles`, attributes with `attrs`,
and a helpful shortcut for the `transform` attribute which allows you to break
it into parts.

You should try to only modify the opacity and transforms, as they're cheap to
animate: anything else could reduce the frame rate of your application.

The below code changes the opacity from 1 to 0 when the y position of the page
gets below 600:

```js
const transforms = new Transformer([
  {
    el: document.querySelector('.my-element'),
    styles: [
      ['opacity', function (x, y, i) {
        if (y > 600) {
          return 0;
        }
        
        return 1;
      }]
    ]
  }
]);
```

The three arguments provided to the function are `x`, `y` and `i`: the distance
scrolled horizontally on the page (the `x` value), the distance scrolled
vertically (`y`), and the number of times the function has been called (`i`),
which can be very useful for running animations through time: it's called about
60 times per second in a performant page.

The `visible` property is optional, but will improve performance on pages with
lots of elements and transforms: it tests whether the vertical scroll value of
the page is between the two numbers, and if it isn't, it sets `display: none`
and doesn't attempt to calculate the properties. You can also use the
`transforms.setVisible()` method to set the `visible` property on all items
of the transform at once.

The `this` value in transform functions is set to the transform itself, so any
properties set on the object are accessible using `this`.

### Helper functions

`transform-when` contains a couple **helper functions** to help us animate
values between each other:

#### `Transformer.transform()`

A simple scale function with three arguments, domain, range, and value:

```js
Transformer.transform([400, 600], [1, 0], 400); // 1
Transformer.transform([400, 600], [1, 0], 500); // 0.5
Transformer.transform([400, 600], [1, 0], 600); // 0
```

If only given two arguments, it'll return a function that can be called with
the final value, but there is no performance advantage to doing this:

```js
const myTransform = Transformer.transform([400, 600], [1, 0]);

myTransform(400); // 1
myTransform(500); // 0.5
myTransform(600); // 0
```

#### `Transformer.transformObj()`

A slightly more complicated, more powerful version of the previous function. It
takes an object with input values and output values:

```js
const myTransform = Transformer.transformObj({
  400: 1,
  600: 0,
  1000: 0,
  1200: 1
});

myTransform(0); // 1
myTransform(400); // 1
myTransform(500); // 0.5
myTransform(600); // 0
```

If the y position of the page were passed in and the result used as an opacity,
the above code would make the element start visible, then fade it out between
400px and 600px, then fade it back in again between 1000px and 1200px.

This function has two more arguments, `loopBy` and `easing`, and I need to
write documentation for them. `loopBy` is a number after which the transform
should loop back to the beginning, and `easing` is a function which is given
a number between 0 and 1 and returns a number between 0 and 1 to transform the
actual value of the transform.

### Stopping the animations

Calling `new Transformer()` returns an object with a `.stop()` method which can
be called to stop the animations from running.

There's also a `.start()` method that can be used to start it again.

### Resetting the animations

To restore the elements to their original transforms and visiblities, call
`.reset()` on the transformer you want to reset.


## License

Released under the MIT license.

[SamKnows]: http://samknows.com/