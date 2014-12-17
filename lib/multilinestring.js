module.exports = MultiLineString;

var Types = require('./types');
var Geometry = require('./geometry');
var LineString = require('./linestring');
var BinaryWriter = require('./binarywriter');

function MultiLineString(lineStrings) {
    this.lineStrings = lineStrings || [];
}

MultiLineString._parseWkt = function (value) {
    var multiLineString = new MultiLineString();

    if (value.isMatch(['EMPTY']))
        return multiLineString;

    value.expectGroupStart();

    do {
        value.expectGroupStart();
        multiLineString.lineStrings.push(new LineString(value.matchCoordinates()));
        value.expectGroupEnd();
    } while (value.isMatch([',']));

    value.expectGroupEnd();

    return multiLineString;
};

MultiLineString._parseWkb = function (value, hasM, hasZ) {
    var multiLineString = new MultiLineString();

    var pointCount = value.readUInt32();

    for (var i = 0; i < pointCount; i++)
        multiLineString.lineStrings.push(Geometry.parse(value, hasM, hasZ));

    return multiLineString;
};

MultiLineString.prototype.toWkt = function () {
    if (this.lineStrings.length === 0)
        return Types.wkt.MultiLineString + ' EMPTY';

    var wkt = Types.wkt.MultiLineString + '(';

    for (var i = 0; i < this.lineStrings.length; i++)
        wkt += this.lineStrings[i]._toInnerWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

MultiLineString.prototype.toWkb = function (options) {
    options = options || {};
    var wkb = new BinaryWriter(this._getWkbSize(), options);

    wkb.writeEndianFlagInt8();

    wkb.writeUInt32(Types.wkb.MultiLineString);
    wkb.writeUInt32(this.lineStrings.length);

    for (var i = 0; i < this.lineStrings.length; i++)
        wkb.writeBuffer(this.lineStrings[i].toWkb(options));

    return wkb.buffer;
};

MultiLineString.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    for (var i = 0; i < this.lineStrings.length; i++)
        size += this.lineStrings[i]._getWkbSize();

    return size;
};

MultiLineString.prototype.hasM = function () {
    return this.lineStrings.every(function(geom) { return geom.hasM(); });
};

MultiLineString.prototype.hasZ = function () {
    return this.lineStrings.every(function(geom) { return geom.hasZ(); });
};
