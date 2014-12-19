module.exports = Geometry;

var Types = require('./types');
var Point = require('./point');
var LineString = require('./linestring');
var Polygon = require('./polygon');
var MultiPoint = require('./multipoint');
var MultiLineString = require('./multilinestring');
var MultiPolygon = require('./multipolygon');
var GeometryCollection = require('./geometrycollection');
var BinaryReader = require('./binaryreader');
var WktParser = require('./wktparser');

function Geometry() {
}

Geometry.parse = function (value) {
    var valueType = typeof value;

    if (valueType === 'string' || value instanceof WktParser)
        return Geometry._parseWkt(value);
    else if (Buffer.isBuffer(value) || value instanceof BinaryReader)
        return Geometry._parseWkb(value);
    else
        throw new Error('first argument must be a string or Buffer');
};

Geometry._parseWkt = function (value) {
    var wktParser;

    if (value instanceof WktParser)
        wktParser = value;
    else
        wktParser = new WktParser(value);

    var geometryType = wktParser.matchType();

    switch (geometryType) {
    case Types.wkt.Point:
        return Point._parseWkt(wktParser);
    case Types.wkt.LineString:
        return LineString._parseWkt(wktParser);
    case Types.wkt.Polygon:
        return Polygon._parseWkt(wktParser);
    case Types.wkt.MultiPoint:
        return MultiPoint._parseWkt(wktParser);
    case Types.wkt.MultiLineString:
        return MultiLineString._parseWkt(wktParser);
    case Types.wkt.MultiPolygon:
        return MultiPolygon._parseWkt(wktParser);
    case Types.wkt.GeometryCollection:
        return GeometryCollection._parseWkt(wktParser);
    default:
        throw new Error('GeometryType ' + geometryType + ' not supported');
    }
};

Geometry._parseWkb = function (value, hasM, hasZ) {
    var binaryReader;

    if (value instanceof BinaryReader)
        binaryReader = value;
    else
        binaryReader = new BinaryReader(value);

    binaryReader.isBigEndian = !binaryReader.readInt8();

    var geometryType = binaryReader.readUInt32();

    // Parse and strip PostGIS EWKB flags.
    var srid;
    if(geometryType & Types.ewkbFlags.SRID) {
        srid = binaryReader.readUInt32();
    }
    hasM = (geometryType & Types.ewkbFlags.M);
    hasZ = (geometryType & Types.ewkbFlags.Z);
    geometryType = geometryType & ~(Types.ewkbFlags.SRID | Types.ewkbFlags.M | Types.ewkbFlags.Z);

    // Parse and strip SQL/MM part 3 "flags".
    if(geometryType > Types.sqlMM3Flags.M) {
        hasM = true;
        geometryType -= Types.sqlMM3Flags.M;
    }
    if(geometryType > Types.sqlMM3Flags.Z) {
        hasZ = true;
        geometryType -= Types.sqlMM3Flags.Z;
    }

    var parsed;
    switch (geometryType) {
    case Types.wkb.Point:
        parsed = Point._parseWkb(binaryReader, hasM, hasZ);
        break;
    case Types.wkb.LineString:
        parsed = LineString._parseWkb(binaryReader, hasM, hasZ);
        break;
    case Types.wkb.Polygon:
        parsed = Polygon._parseWkb(binaryReader, hasM, hasZ);
        break;
    case Types.wkb.MultiPoint:
        parsed = MultiPoint._parseWkb(binaryReader, hasM, hasZ);
        break;
    case Types.wkb.MultiLineString:
        parsed = MultiLineString._parseWkb(binaryReader, hasM, hasZ);
        break;
    case Types.wkb.MultiPolygon:
        parsed = MultiPolygon._parseWkb(binaryReader, hasM, hasZ);
        break;
    case Types.wkb.GeometryCollection:
        parsed = GeometryCollection._parseWkb(binaryReader, hasM, hasZ);
        break;
    default:
        throw new Error('GeometryType ' + geometryType + ' not supported');
    }

    if(srid !== undefined) {
        parsed.srid = srid;
    }

    return parsed;
};
