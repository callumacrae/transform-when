/**
 * Hello! Best place to start is probably run-frames.js and Transformer.js.
 */

import Transformer from './Transformer';
import * as helpers from './transform-helpers';

import './run-frames';

Transformer.transform = helpers.transform;
Transformer.easings = helpers.easings;
Transformer.transformObj = helpers.transformObj;

export default Transformer;
