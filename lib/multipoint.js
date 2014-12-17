module.exports = MultiPoint;

var Types = require('./types');
var Geometry = require('./geometry');
var BinaryWriter = require('./binarywriter');

function MultiPoint(points) {
    this.points = points || [];
}

MultiPoint._parseWkt = function (value) {
    var multiPoint = new MultiPoint();

    if (value.isMatch(['EMPTY']))
        return multiPoint;

    value.expectGroupStart();
    multiPoint.points.push.apply(multiPoint.points, value.matchCoordinates());
    value.expectGroupEnd();

    return multiPoint;
};

MultiPoint._parseWkb = function (value, hasM, hasZ) {
    var multiPoint = new MultiPoint();

    var pointCount = value.readUInt32();

    for (var i = 0; i < pointCount; i++)
        multiPoint.points.push(Geometry.parse(value, hasM, hasZ));

    return multiPoint;
};

MultiPoint.prototype.toWkt = function () {
    if (this.points.length === 0)
        return Types.wkt.MultiPoint + ' EMPTY';

    var wkt = Types.wkt.MultiPoint + '(';

    for (var i = 0; i < this.points.length; i++)
        wkt += this.points[i].x + ' ' + this.points[i].y + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

MultiPoint.prototype.toWkb = function (options) {
    options = options || {};
    var wkb = new BinaryWriter(this._getWkbSize(), options);

    wkb.writeEndianFlagInt8();

    wkb.writeUInt32(Types.wkb.MultiPoint);
    wkb.writeUInt32(this.points.length);

    for (var i = 0; i < this.points.length; i++)
        wkb.writeBuffer(this.points[i].toWkb(options));

    return wkb.buffer;
};

MultiPoint.prototype._getWkbSize = function () {
    return 1 + 4 + 4 + (this.points.length * 21);
};

MultiPoint.prototype.hasM = function () {
    return this.points.every(function(geom) { return geom.hasM(); });
};

MultiPoint.prototype.hasZ = function () {
    return this.points.every(function(geom) { return geom.hasZ(); });
};
