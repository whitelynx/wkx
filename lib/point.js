module.exports = Point;

var util = require('util');
var Base = require('./base');

var Types = require('./types');
var BinaryWriter = require('./binarywriter');

function Point(x, y, m, z) {
    this.x = x;
    this.y = y;
    this.m = m;
    this.z = z;
}

util.inherits(Point, Base);

Point._parseWkt = function (value) {
    var point = new Point();

    if (value.isMatch(['EMPTY']))
        return point;

    value.expectGroupStart();

    var coordinate = value.matchCoordinate();

    point.x = coordinate.x;
    point.y = coordinate.y;

    value.expectGroupEnd();

    return point;
};

Point._parseWkb = function (value, hasM, hasZ) {
    return new Point(value.readDouble(), value.readDouble(),
        hasM ? value.readDouble() : undefined, hasZ ? value.readDouble() : undefined);
};

Point.prototype.toWkt = function () {
    if (typeof this.x === 'undefined' && typeof this.y === 'undefined')
        return Types.wkt.Point + ' EMPTY';

    return Types.wkt.Point + '(' + this.x + ' ' + this.y + ')';
};

Point.prototype.toWkb = function (options) {
    options = options || {};
    var wkb = new BinaryWriter(this._getWkbSize(), options);

    wkb.writeEndianFlagInt8();

    if (typeof this.x === 'undefined' && typeof this.y === 'undefined') {
        wkb.writeUInt32(Types.wkb.MultiPoint);
        wkb.writeUInt32(0);
    }
    else {
        wkb.writeUInt32(this._getWkbType(options));
        wkb.writeDouble(this.x);
        wkb.writeDouble(this.y);
        if(this.hasM()) {
            wkb.writeDouble(this.m);
        }
        if(this.hasZ()) {
            wkb.writeDouble(this.z);
        }
    }

    return wkb.buffer;
};

Point.prototype._baseWkbType = Types.wkb.Point;

Point.prototype._getWkbType = function (options) {
    var flags = (options.postgis ? Types.ewkbFlags : Types.sqlMM3Flags);
    return this._baseWkbType +
        (this.hasM() ? flags.M : 0) +
        (this.hasZ() ? flags.Z : 0);
};

Point.prototype._getWkbSize = function () {
    if (typeof this.x === 'undefined' && typeof this.y === 'undefined')
        return 1 + 4 + 4;

    var size = 1 + 4 + 8 + 8;
    if(this.hasM()) {
        size += 8;
    }
    if(this.hasZ()) {
        size += 8;
    }
    return size;
};

Point.prototype.hasM = function () {
    return this.m !== undefined;
};

Point.prototype.hasZ = function () {
    return this.z !== undefined;
};
