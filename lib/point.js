module.exports = Point;

var Types = require('./types');
var BinaryWriter = require('./binarywriter');

function Point(x, y, m, z) {
    this.x = x;
    this.y = y;
    this.m = m;
    this.z = z;
}

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
        wkb.writeUInt32(Types.wkb.Point);
        wkb.writeDouble(this.x);
        wkb.writeDouble(this.y);
    }

    return wkb.buffer;
};

Point.prototype._getWkbSize = function () {
    if (typeof this.x === 'undefined' && typeof this.y === 'undefined')
        return 1 + 4 + 4;

    return 1 + 4 + 8 + 8;
};

Point.prototype.hasM = function () {
    return this.m !== undefined;
};

Point.prototype.hasZ = function () {
    return this.z !== undefined;
};
