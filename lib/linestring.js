module.exports = LineString;

var Types = require('./types');
var Point = require('./point');
var BinaryWriter = require('./binarywriter');

function LineString(points) {
    this.points = points || [];
}

LineString._parseWkt = function (value) {
    var lineString = new LineString();

    if (value.isMatch(['EMPTY']))
        return lineString;

    value.expectGroupStart();
    lineString.points.push.apply(lineString.points, value.matchCoordinates());
    value.expectGroupEnd();

    return lineString;
};

LineString._parseWkb = function (value, hasM, hasZ) {
    var lineString = new LineString();

    var pointCount = value.readUInt32();

    for (var i = 0; i < pointCount; i++)
        lineString.points.push(Point._parseWkb(value, hasM, hasZ));

    return lineString;
};

LineString.prototype.toWkt = function () {
    if (this.points.length === 0)
        return Types.wkt.LineString + ' EMPTY';

    return Types.wkt.LineString + this._toInnerWkt();
};

LineString.prototype._toInnerWkt = function () {
    var innerWkt = '(';

    for (var i = 0; i < this.points.length; i++)
        innerWkt += this.points[i].x + ' ' + this.points[i].y + ',';

    innerWkt = innerWkt.slice(0, -1);
    innerWkt += ')';

    return innerWkt;
};

LineString.prototype.toWkb = function () {
    var wkb = new BinaryWriter(this._getWkbSize());

    wkb.writeInt8(1);

    wkb.writeUInt32LE(Types.wkb.LineString);
    wkb.writeUInt32LE(this.points.length);

    for (var i = 0; i < this.points.length; i++) {
        wkb.writeDoubleLE(this.points[i].x);
        wkb.writeDoubleLE(this.points[i].y);
    }

    return wkb.buffer;
};

LineString.prototype._getWkbSize = function () {
    return 1 + 4 + 4 + (this.points.length * 16);
};

LineString.prototype.hasM = function () {
    return this.points.every(function(geom) { return geom.hasM(); });
};

LineString.prototype.hasZ = function () {
    return this.points.every(function(geom) { return geom.hasZ(); });
};
