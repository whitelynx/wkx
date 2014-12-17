module.exports = BinaryWriter;

function BinaryWriter(size, options) {
    this.buffer = new Buffer(size);
    this.position = 0;
    this.bigEndian = (options || {}).bigEndian;
}

function _write(write, size) {
    return function (value) {
        write.call(this.buffer, value, this.position);
        this.position += size;
    };
}

BinaryWriter.prototype.writeUInt8 = _write(Buffer.prototype.writeUInt8, 1);
BinaryWriter.prototype.writeUInt16LE = _write(Buffer.prototype.writeUInt16LE, 2);
BinaryWriter.prototype.writeUInt16BE = _write(Buffer.prototype.writeUInt16BE, 2);
BinaryWriter.prototype.writeUInt32LE = _write(Buffer.prototype.writeUInt32LE, 4);
BinaryWriter.prototype.writeUInt32BE = _write(Buffer.prototype.writeUInt32BE, 4);
BinaryWriter.prototype.writeInt8 = _write(Buffer.prototype.writeInt8, 1);
BinaryWriter.prototype.writeInt16LE = _write(Buffer.prototype.writeInt16LE, 2);
BinaryWriter.prototype.writeInt16BE = _write(Buffer.prototype.writeInt16BE, 2);
BinaryWriter.prototype.writeInt32LE = _write(Buffer.prototype.writeInt32LE, 4);
BinaryWriter.prototype.writeInt32BE = _write(Buffer.prototype.writeInt32BE, 4);
BinaryWriter.prototype.writeFloatLE = _write(Buffer.prototype.writeFloatLE, 4);
BinaryWriter.prototype.writeFloatBE = _write(Buffer.prototype.writeFloatBE, 4);
BinaryWriter.prototype.writeDoubleLE = _write(Buffer.prototype.writeDoubleLE, 8);
BinaryWriter.prototype.writeDoubleBE = _write(Buffer.prototype.writeDoubleBE, 8);

function _endianWrite(writeLE, writeBE, size) {
    return function (value) {
        (this.bigEndian ? writeBE : writeLE).call(this.buffer, value, this.position);
        this.position += size;
    };
}

BinaryWriter.prototype.writeUInt16 = _endianWrite(Buffer.prototype.writeUInt16LE, Buffer.prototype.writeUInt16BE, 2);
BinaryWriter.prototype.writeUInt32 = _endianWrite(Buffer.prototype.writeUInt32LE, Buffer.prototype.writeUInt32BE, 4);
BinaryWriter.prototype.writeInt16 = _endianWrite(Buffer.prototype.writeInt16LE, Buffer.prototype.writeInt16BE, 2);
BinaryWriter.prototype.writeInt32 = _endianWrite(Buffer.prototype.writeInt32LE, Buffer.prototype.writeInt32BE, 4);
BinaryWriter.prototype.writeFloat = _endianWrite(Buffer.prototype.writeFloatLE, Buffer.prototype.writeFloatBE, 4);
BinaryWriter.prototype.writeDouble = _endianWrite(Buffer.prototype.writeDoubleLE, Buffer.prototype.writeDoubleBE, 8);

BinaryWriter.prototype.writeEndianFlagInt8 = function () {
    this.writeInt8(this.bigEndian ? 0 : 1);
};

BinaryWriter.prototype.writeBuffer = function (buffer) {
    buffer.copy(this.buffer, this.position, 0, buffer.length);
    this.position += buffer.length;
};
