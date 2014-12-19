module.exports = Polygon;

var util = require('util');
var Base = require('./base');

var Types = require('./types');
var Point = require('./point');
var BinaryWriter = require('./binarywriter');

function Polygon(exteriorRing, interiorRings) {
    this.exteriorRing = exteriorRing || [];
    this.interiorRings = interiorRings || [];
}

util.inherits(Polygon, Base);

Polygon._parseWkt = function (value) {
    var polygon = new Polygon();

    if (value.isMatch(['EMPTY']))
        return polygon;

    value.expectGroupStart();

    value.expectGroupStart();
    polygon.exteriorRing.push.apply(polygon.exteriorRing, value.matchCoordinates());
    value.expectGroupEnd();

    while (value.isMatch([','])) {
        value.expectGroupStart();
        polygon.interiorRings.push(value.matchCoordinates());
        value.expectGroupEnd();
    }

    value.expectGroupEnd();

    return polygon;
};

Polygon._parseWkb = function (value, hasM, hasZ) {
    var polygon = new Polygon();

    var ringCount = value.readUInt32();

    if (ringCount > 0) {
        var exteriorRingCount = value.readUInt32();

        for (var i = 0; i < exteriorRingCount; i++)
            polygon.exteriorRing.push(Point._parseWkb(value, hasM, hasZ));

        for (i = 1; i < ringCount; i++) {
            var interiorRing = [];

            var interiorRingCount = value.readUInt32();

            for (var j = 0; j < interiorRingCount; j++)
                interiorRing.push(Point._parseWkb(value, hasM, hasZ));

            polygon.interiorRings.push(interiorRing);
        }
    }

    return polygon;
};

Polygon.prototype.toWkt = function () {
    if (this.exteriorRing.length === 0)
        return Types.wkt.Polygon + ' EMPTY';

    return Types.wkt.Polygon + this._toInnerWkt();
};

Polygon.prototype._toInnerWkt = function () {
    var innerWkt = '((';

    for (var i = 0; i < this.exteriorRing.length; i++)
        innerWkt += this.exteriorRing[i].x + ' ' + this.exteriorRing[i].y + ',';

    innerWkt = innerWkt.slice(0, -1);
    innerWkt += ')';

    for (i = 0; i < this.interiorRings.length; i++) {
        innerWkt += ',(';

        for (var j = 0; j < this.interiorRings[i].length; j++) {
            innerWkt += this.interiorRings[i][j].x + ' ' + this.interiorRings[i][j].y + ',';
        }

        innerWkt = innerWkt.slice(0, -1);
        innerWkt += ')';
    }

    innerWkt += ')';

    return innerWkt;
};

Polygon.prototype.toWkb = function (options) {
    options = options || {};
    var wkb = new BinaryWriter(this._getWkbSize(), options);

    wkb.writeEndianFlagInt8();

    wkb.writeUInt32(this._getWkbType(options));

    if (this.exteriorRing.length > 0) {
        wkb.writeUInt32(1 + this.interiorRings.length);
        wkb.writeUInt32(this.exteriorRing.length);
    }
    else {
        wkb.writeUInt32(0);
    }

    for (var i = 0; i < this.exteriorRing.length; i++) {
        wkb.writeDouble(this.exteriorRing[i].x);
        wkb.writeDouble(this.exteriorRing[i].y);
    }

    for (i = 0; i < this.interiorRings.length; i++) {
        wkb.writeUInt32(this.interiorRings[i].length);

        for (var j = 0; j < this.interiorRings[i].length; j++) {
            wkb.writeDouble(this.interiorRings[i][j].x);
            wkb.writeDouble(this.interiorRings[i][j].y);
        }
    }

    return wkb.buffer;
};

Polygon.prototype._baseWkbType = Types.wkb.Polygon;

Polygon.prototype._getWkbType = function (options) {
    var flags = (options.postgis ? Types.ewkbFlags : Types.sqlMM3Flags);
    return this._baseWkbType +
        (this.hasM() ? flags.M : 0) +
        (this.hasZ() ? flags.Z : 0);
};

Polygon.prototype._getWkbSize = function () {
    var size = 1 + 4 + 4;

    if (this.exteriorRing.length > 0)
        size += 4 + (this.exteriorRing.length * 16);

    for (var i = 0; i < this.interiorRings.length; i++)
        size += 4 + (this.interiorRings[i].length * 16);

    return size;
};

Polygon.prototype.hasM = function () {
    return this.exteriorRing.every(function(geom) { return geom.hasM(); }) &&
        this.interiorRings.every(function(ring) {
            return ring.every(function(geom) { return geom.hasM(); });
        });
};

Polygon.prototype.hasZ = function () {
    return this.exteriorRing.every(function(geom) { return geom.hasZ(); }) &&
        this.interiorRings.every(function(ring) {
            return ring.every(function(geom) { return geom.hasZ(); });
        });
};
