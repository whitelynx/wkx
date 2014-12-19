module.exports = MultiPolygon;

var util = require('util');
var Base = require('./base');

var Types = require('./types');
var Geometry = require('./geometry');
var Polygon = require('./polygon');
var BinaryWriter = require('./binarywriter');

function MultiPolygon(polygons) {
    this.polygons = polygons || [];
}

util.inherits(MultiPolygon, Base);

MultiPolygon._parseWkt = function (value) {
    var multiPolygon = new MultiPolygon();

    if (value.isMatch(['EMPTY']))
        return multiPolygon;

    value.expectGroupStart();

    do {
        value.expectGroupStart();

        var polygon = new Polygon();

        value.expectGroupStart();
        polygon.exteriorRing.push.apply(polygon.exteriorRing, value.matchCoordinates());
        value.expectGroupEnd();

        while (value.isMatch([','])) {
            value.expectGroupStart();
            polygon.interiorRings.push(value.matchCoordinates());
            value.expectGroupEnd();
        }

        multiPolygon.polygons.push(polygon);

        value.expectGroupEnd();

    } while (value.isMatch([',']));

    value.expectGroupEnd();

    return multiPolygon;
};

MultiPolygon._parseWkb = function (value, hasM, hasZ) {
    var multiPolygon = new MultiPolygon();

    var polygonCount = value.readUInt32();

    for (var i = 0; i < polygonCount; i++)
        multiPolygon.polygons.push(Geometry.parse(value, hasM, hasZ));

    return multiPolygon;
};

MultiPolygon.prototype.toWkt = function () {
    if (this.polygons.length === 0)
        return Types.wkt.MultiPolygon + ' EMPTY';

    var wkt = Types.wkt.MultiPolygon + '(';

    for (var i = 0; i < this.polygons.length; i++)
        wkt += this.polygons[i]._toInnerWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

MultiPolygon.prototype.toWkb = function (options) {
    options = options || {};
    var wkb = new BinaryWriter(this._getWkbSize(), options);

    wkb.writeEndianFlagInt8();

    wkb.writeUInt32(this._getWkbType(options));
    wkb.writeUInt32(this.polygons.length);

    for (var i = 0; i < this.polygons.length; i++)
        wkb.writeBuffer(this.polygons[i].toWkb(options));

    return wkb.buffer;
};

MultiPolygon.prototype._baseWkbType = Types.wkb.MultiPolygon;

MultiPolygon.prototype._getWkbType = function (options) {
    var flags = (options.postgis ? Types.ewkbFlags : Types.sqlMM3Flags);
    return this._baseWkbType +
        (this.hasM() ? flags.M : 0) +
        (this.hasZ() ? flags.Z : 0);
};

MultiPolygon.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    for (var i = 0; i < this.polygons.length; i++)
        size += this.polygons[i]._getWkbSize();

    return size;
};

MultiPolygon.prototype.hasM = function () {
    return this.polygons.every(function(geom) { return geom.hasM(); });
};

MultiPolygon.prototype.hasZ = function () {
    return this.polygons.every(function(geom) { return geom.hasZ(); });
};
