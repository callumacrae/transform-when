# transform-when [![Build Status](https://travis-ci.org/SamKnows/transform-when.svg?branch=master)](https://travis-ci.org/SamKnows/transform-when)

> A library for handing animations combining page position and time, written at [SamKnows].

![](https://giant.gfycat.com/ScarceImaginativeLamprey.gif)

For a full demo at 60fps, see: [samknows.com][SamKnows], or for a simpler demo,
check out [this article I wrote].

## Installation

```
$ npm install --save transform-when
```

## Features

- Blurs the line the between **reactive and time-based animations**, allowing
you to combine variables such as page position, time, and user actions.
- Uses a number of techniques to ensure **extremely high performance**: both on 
desktop and on mobile.
  - Uses **pure functions** to intelligently know when a property is going to
  change without having to call the transform function first.
  - Calculates every value to set, and then sets them all in one go, effectively
  making **layout thrashing impossible**.
  - Stores property values and compares changes against the old values to
  ensure that it actually is a change before setting it: sort of like a virtual
  DOM, but without a virtual DOM.
  - Uses `requestAnimationFrame` to ensure that it is only ran when necessary.
- It is **powerful**. You can make complicated animations with this library.
- Because it is low-level and doesn't contain any knowledge of the stuff it is
animating (that bit is left up to you), it's extremely lightweight: minified
and gzipped, the whole library is **under 10KB**
- Works with both HTML elements and SVG elements.
- Tested in IE11+.

## Usage

```js
const Transformer = require('transform-when');

new Transformer([
  {
    el: document.querySelector('.my-element'),
    styles: [
      ['opacity', function (y) {
        if (y > 600) {
          return 0;
        }
        
        return 1;
      }]
    ]
  }
]);
```

The above code sets up a fairly simple transformer: it sets the opacity of the
element to 0 if `window.scrollY` reaches more than 600, and back to 1 if the
user scrolls back up above 600px again.

In addition to **styles**, transform-when can animate **attrs**, and
**transforms**. transforms is a helper function, and will set the `transform`
style on HTML elements and the `transform` property on SVG elements.

Let's take a look at a longer example that uses all three:

```js
const Transformer = require('transform-when');

const transforms = new Transformer([
  {
    el: document.querySelector('.my-element'),
    styles: [
      ['opacity', function (y) {
        // This function animates the opacity from 1 to 0 between 500px and 600px:
        // we'll explore it some more later.
        return Transformer.transform([500, 600], [1, 0], y);
      }]
    ],
    attrs: [
      ['class', function (y) {
        return 'my-element' + (y > 500 && y < 600 ? ' animating' : '');
      }]
    ],
    transforms: [
      ['scale', function (y) {
        return Transformer.transform([500, 600], [1, 0.5], y);
      }]
    ]
  }
]);
```

That code would take the element (or elements) matching `.my-element`, and then
when the user scrolls between 500px and 600px, it would animate the opacity 
from 1 to 0, animate the scale from 1 to 0.5, and apply the `animating` class.

### Terminology

- The `Transformer` function takes either a **transform object** or an array of
them.
- Each transform object should have an `el` property containing an element (or
NodeList) and some **properties** to animate: styles, attrs, and transforms.
- Properties use **transform functions** to calculate what values should be
changed. Transform functions should be pure functions (without side effects),
and request only the arguments requested so they can be heavily optimised.

That's it.

### Transform function arguments (smart arguments)

The transform functions above only have one argument, `y`, but if you were to
change that to `x` or `i`, you would get a different number. This is because
transform-when uses the arguments to detect when a property needs to be changed
before actually calling the transform function: if the only argument is `y` and
the y position of the page hasn't changed since the function was last called,
then it doesn't bother to call the transform function.

This is what makes transform-when so performant - but it means that transform
functions should be pure as much as possible (if you want something to be
random, don't worry - read the section on `i` below).

There are (currently) four different arguments you can request: `y`, `x`, `i`
and `actions`.

#### Scroll position (`x` and `y`)

The `x` and `y` values are simply `window.scrollX` and `window.scrollY` (or the
IE equivalents)—how far down or along the page the user has scrolled.

#### Time (`i`)

`i` starts at 0, and increases by 1 for each frame—effectively, it's the frame
number. This is useful for animating by time.

If you want the actual time or a duration, you can calculate that yourself
using `Date.now()`.

If you want an impure transform function—say, you want to change it a bit
randomly—request the `i` argument and the transform function will be called
every time.

#### User actions (`actions`)

Sometimes you want a break in the normal animation: say, if a user clicks on
something, or if a certain position on the page is reached. transform-when has
a concept of actions: these can be triggered, and then play for a given amount
of time.

You trigger them using the `.trigger()` method, and they're passed in using an
`actions` argument:

```js
const transforms = new Transformer([
  {
    el: document.querySelector('.my-element'),
    transforms: [
      ['rotate', function (actions) {
        // actions === { spin: x } where x is a number between 0 and 1
        
        if (actions.spin) {
          return 360 * actions.spin;
        }
        
        return 0;
      }, 'deg']
    ]
  }
]);

transforms.trigger('spin', 2000);
```

Multiple actions can be triggered at the same time.

The `.trigger()` function returns a promise which resolves when the action
completes. It uses native promises, and will return `undefined` when
`window.Promise` is undefined.

#### Custom variables

It's possible to add your own variables.

```js
const transforms = new Transformer([
  {
    el: document.querySelector('.my-element'),
    styles: [
      ['opacity', function (myCustomVariable) {
      
      }]
    ]
  }
]);

transforms.addVariable('myCustomVariable', function () {
  // Return what you want `myCustomVariable` to equal
});
```

The transform function is still only called when the variable is changed - 
except for the way it is generated, custom variables are treated exactly the
same as scroll position, time and user actions.

#### Minifiers

Minifiers will, by default, break transform-when if they rename variables. The
way around this is to wrap the function in an array saying what variables you
need:

```js
const transforms = new Transformer([
  {
    el: document.querySelector('.my-element'),
    transforms: [
      ['rotate', ['actions', function (actions) {
        if (actions.spin) {
          return 360 * actions.spin;
        }
        
        return 0;
      }], 'deg']
    ]
  }
]);
```

The minifier won't touch the string, and transform-when will look at that
instead.

### `this`

In a transform function, `this` refers to the transform object. This allows
you to store stuff like scales on the transform object:

```js
const transforms = new Transformer([
  {
    el: document.querySelector('.my-element'),
    colorScale: chroma.scale(['red', 'blue']).domain([500, 600]),
    styles: [
      ['color', function (y) {
        return this.colorScale(y);
      }]
    ]
  }
]);
```

### Types of properties

There are three types of properties, `styles`, `attrs` and `transforms`. The
first two are both pretty simple: they just set styles and attributes of an
element. Be careful animating attributes and styles that aren't the opacity:
they are more expensive to animate than transforms and opacity, and might make
your animation jerky.

Each takes an array of three things: the property (style or attribute) to
animate, the transform functions, and optionally the unit to use - it's better
to let transform-when handle adding the unit, because it will also round the
number for you.

Let's take a look at an example:

```js
const transforms = new Transformer([
  {
    el: document.querySelector('.my-element'),
    styles: [
      ['padding', function (y) {
        return Transformer.transform([500, 600], [20, 50], y);
      }, 'px']
    ],
    attrs: [
      ['class', function (y) {
        return 'my-element' + (y > 500 && y < 600 ? ' animating' : '');
      }]
    ],
  }
]);
```

That animates the padding of an element from 20px to 50px, and adds the
`animating` class.

Transforms are a little trickier.

#### Animating transforms

CSS or SVG transforms are all set on one property. For example, a CSS transform
could be `scaleY(0.5) translate(10px 20px)` and an SVG transform could be
`scale(1 0.5) translate(10 20)`. Transforms are the reason for the slightly
strange syntax using arrays for properties, not objects: order is important.
Translating an element then scaling it is pretty different to scaling it and
then translating it.

transform-when looks at the array, turning each property into part of the
transform attribute (for SVG) or style (for HTML elements).

```js
const transforms = new Transformer([
  {
    el: document.querySelector('.my-element'),
    transforms: [
      ['scale', function (y) {
        return Transformer.transform([500, 600], [1, 1.5], y);
      }],
      ['translateX', function (y) {
        return Transformer.transform([500, 600], [0, 50], y);
      }, 'px']
    ]
  }
]);
```

That would return `scale(1) translateX(0px)` when the y position of the page is
500px, `scale(1.5) translateX(50px)` when the y position of the page is 600px,
and transition between the two.

Because the library doesn't have any knowledge of the properties it is
animating, remember to specify units when required for CSS transforms, and
don't try to use `scaleY` on an SVG!

#### Animating multiple properties at once

Sometimes it's necessary to animate multiple properties at the same time with
the same value—for example, for CSS vendor prefixes. It isn't necessary to
specify two different properties with the same transform functions (and it
would be pretty inefficient, too): you can just specify the property as an
array:

```js
const transformer = new Transformer([
  {
    el: mock,
    styles: [
      [['clip-path', 'webkit-clip-path'], function (i) {
        return 'circle(50px at 0% 100px)';
      }]
    ]
  }
]);
```

### Transform helpers

transform-when provides a couple functions to help with animating values
between two different points: `Transformer.transform()`, and
`Transformer.transformObj()`. If you're familiar with d3,
`Transformer.transform()` work pretty similar to d3's scale functions.

Both functions map a domain to a range: for example, if you want to animate
the scale of an element from 1 to 2 between the y positions of 500px and 600px,
you could do it like this:

```js
const scale = (x) => (2 - 1) * (y - 500) / (600 - 500) + 1;
```

That gets complicated. Instead, you can use one of the helpers:

```js
Transformer.transform([500, 600], [1, 2], y);
```

#### `Transformer.transform()`

A simple scale function with three arguments, domain, range, and value. Takes
the value and converts it into a new number.

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
takes an object with input values and output values to allow scales with
multiple stages:

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

This function also takes two more arguments, `loopBy` and `easing`.

##### `loopBy`

This argument allows you to specify a point after which the animation should
repeat itself. For example, if you want to animate the scale from 0.5 to 1 and
back again over time, you could do this:

```js
const scaleTransform = Transformer.transformObj({
  0: 0.5,
  30: 1
}, 60);

scaleTransform(i); // Animates from 0.5 to 1 and back repeatedly as i increases
```

##### `easing`

`Transformer.transformObj()` has basic support for easings. You can either pass
in the name of the easing—you can find the built in ones [here][easings]—or you
can pass in you own easing function.

Unlike standard easing functions, they're given one argument and return one
number: both percentages (number between 0 and 1).

For example, a quadratic ease in (`easeInQuad`) looks like this:

```js
const easeInQuad = (x) => x * x;
```

Pull requests adding other easings very welcome!

### visible & setVisible

Transform objects also accept another property, `visible`. This should be two
numbers where when the y position of the page is outside of these values, the
element will not be animated. This helps ensure that if you have a lot of
elements on the page, the ones that aren't being displayed aren't wasting
resources.

```js
const transforms = new Transformer([
  {
    el: document.querySelector('.my-element'),
    visible: [0, 600],
    styles: [
      ['opacity', function (y) {
        return Transformer.transform([500, 600], [1, 0], y);
      }]
    ]
  }
]);
```

You can also set the property on everything at once using the `setVisible()`
method:

```
transforms.setVisible([500, 600]);
```

### Pausing and cancelling an animation

It's possible to stop and start the animation using the `stop()` and `start()`
methods. Stopping the animation will leave the currently animated properties
exactly where they are, and stop `i` from increasing. Starting it again will
resume things from where they were when the animation was stopped.

The following will pause the animation for a second:

```js
transforms.stop();

setTimeout(function () {
  transforms.start();
}, 1000);
```

There's also a `reset()` method for when you want to stop an animation and
restore the transform and element displays to what they were to start off with
(styles and attributes will be left as they were). This is useful if you need
to reinitialise the animate when the window is resized:

```js
let transforms;

function init() {
  if (transforms) {
    transforms.reset();
  }
  
  transforms = new Transformer([ ... ]);
}

init();
window.addEventListener('resize', debounce(init));
```

### Changing the element to get the scroll position from

By default, transform-when gets the scroll positions from the `window`, but
this isn't always what you want. To change it, just change the `scrollElement`
property to contain a selector for the element you want to get the scroll
position of instead:

```js
transforms.scrollElement = '.my-scroll-element';
```

### Configuring how `i` increases

The default behaviour of `i` is to increase by 1 on each frame, up to a maximum
of 60 times. On most monitors, this just means that `i` will be the number of
the frame, because most monitors don't go above 60fps. On monitors that are
capable of a higher fps such as gaming monitors, however, this means that `i`
won't necessarily be a whole number. If the monitor runs at 120fps, `i` will
increase by about 0.5 120 times a second.

This is configurable! There are three options, `belowOptimal` and
`aboveOptimal`, each of which can be set to "count" (to increase by 1 each
frame) or "time" (to increase so that `i` increases by 60 per second). By
default, `belowOptimal` is set to "count" and `aboveOptimal` is set to "time".

You may want to change `belowOptimal` to "time". You probably don't want to
change `aboveOptimal` to "count".

```js
transforms.iIncrease.belowOptimal = 'time';
```

You can also configure the optimal FPS. By default it's 60, but you can change
it:

```js
transforms.iIncrease.optimalFps = 120;
```


## Happy animating :)

🎉

## License

Released under the MIT license.

[SamKnows]: https://samknows.com/
[easings]: https://github.com/SamKnows/transform-when/blob/master/src/transform-helpers.js#L26
[this article I wrote]: http://macr.ae/article/transform-when.html
