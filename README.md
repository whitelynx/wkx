wkx [![Build Status](https://travis-ci.org/cschwarz/wkx.svg?branch=master)](https://travis-ci.org/cschwarz/wkx)
========

A WKT/WKB parser and serializer with support for

- Point
- LineString
- Polygon
- MultiPoint
- MultiLineString
- MultiPolygon
- GeometryCollection

Examples
--------

The following examples show you how to work with wkx.

```javascript
var wkx = require('wkx');

//Parsing a WKT string
var geometry = wkx.Geometry.parse('POINT(1 2)');

//Parsing a node Buffer containing a WKB object
var geometry = wkx.Geometry.parse(wkbBuffer);

//Serializing a Point geometry to WKT
var wktString = new wkx.Point(1, 2).toWkt();

//Serializing a Point geometry to WKB
var wkbBuffer = new wkx.Point(1, 2).toWkb();
```

Browser
-------

To use `wkx` in a webpage, simply copy a built browser version from `dist/` into your project, and use a `script` tag
to include it:
```html
<script src="wkx.js"></script>
```

You may also use [RawGit][] as a CDN, so you don't need to copy `wkx` into your project:
```html
<script src="https://cdn.rawgit.com/cschwarz/wkx/v0.0.4/dist/wkx.js"></script>
```

If you use [browserify][] for your project, you can simply `npm install wkx --save`, and just require `wkx` as usual in
your code.

----

Regardless of which of the preceeding options you choose, using `wkx` in the browser will look the same:
```javascript
var wkx = require('wkx');

var geometry = wkx.Geometry.parse('POINT(1 2)');

document.getElementById('output').innerText = JSON.stringify(geometry, null, '  ');
```

In addition to the `wkx` module, the browser versions also export `buffer`, which is useful for parsing WKB:
```javascript
var Buffer = require('buffer');
var wkx = require('wkx');

var geometry = wkx.Geometry.parse(new Buffer([1,1,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,64]));

document.getElementById('output').innerText = JSON.stringify(geometry, null, '  ');
```

(`buffer` is also made available by browserify, so it will also work the same way regardless of your choice above)

[RawGit]: http://rawgit.com/
[browserify]: http://browserify.org/

### Building the browser version ###

To rebuild the browser version of `wkx.js` based on the current node modules, either install and use [gulp][]...
```bash
gulp
```

...or use the configured `npm` script:
```bash
npm run build
```

To enable source maps for debugging and development, rebuild using the `--debug` flag:
```bash
gulp --debug
```

This will generate `dist/wkx-debug.js` and `dist/wkx-debug.min.js`

Todo
----

- Add support for parsing and serializing 3D/4D geometries (Z, M and ZM)
