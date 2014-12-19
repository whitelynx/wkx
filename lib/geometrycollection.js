module.exports = GeometryCollection;

var util = require('util');
var Base = require('./base');

var Types = require('./types');
var Geometry = require('./geometry');
var BinaryWriter = require('./binarywriter');

function GeometryCollection(geometries) {
    this.geometries = geometries || [];
}

util.inherits(GeometryCollection, Base);

GeometryCollection._parseWkt = function (value) {
    var geometryCollection = new GeometryCollection();

    if (value.isMatch(['EMPTY']))
        return geometryCollection;

    value.expectGroupStart();

    do {
        geometryCollection.geometries.push(Geometry.parse(value));
    } while (value.isMatch([',']));

    value.expectGroupEnd();

    return geometryCollection;
};

GeometryCollection._parseWkb = function (value, hasM, hasZ) {
    var geometryCollection = new GeometryCollection();

    var geometryCount = value.readUInt32();

    for (var i = 0; i < geometryCount; i++)
        geometryCollection.geometries.push(Geometry.parse(value, hasM, hasZ));

    return geometryCollection;
};

GeometryCollection.prototype.toWkt = function () {
    if (this.geometries.length === 0)
        return Types.wkt.GeometryCollection + ' EMPTY';

    var wkt = Types.wkt.GeometryCollection + '(';

    for (var i = 0; i < this.geometries.length; i++)
        wkt += this.geometries[i].toWkt() + ',';

    wkt = wkt.slice(0, -1);
    wkt += ')';

    return wkt;
};

GeometryCollection.prototype.toWkb = function (options) {
    options = options || {};
    var wkb = new BinaryWriter(this._getWkbSize(), options);

    wkb.writeEndianFlagInt8();

    wkb.writeUInt32(this._getWkbType(options));
    wkb.writeUInt32(this.geometries.length);

    for (var i = 0; i < this.geometries.length; i++)
        wkb.writeBuffer(this.geometries[i].toWkb(options));

    return wkb.buffer;
};

GeometryCollection.prototype._baseWkbType = Types.wkb.GeometryCollection;

GeometryCollection.prototype._getWkbType = function (options) {
    var flags = (options.postgis ? Types.ewkbFlags : Types.sqlMM3Flags);
    return this._baseWkbType +
        (this.hasM() ? flags.M : 0) +
        (this.hasZ() ? flags.Z : 0);
};

GeometryCollection.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    for (var i = 0; i < this.geometries.length; i++)
        size += this.geometries[i]._getWkbSize();

    return size;
};

GeometryCollection.prototype.hasM = function () {
    return this.geometries.every(function(geom) { return geom.hasM(); });
};

GeometryCollection.prototype.hasZ = function () {
    return this.geometries.every(function(geom) { return geom.hasZ(); });
};
