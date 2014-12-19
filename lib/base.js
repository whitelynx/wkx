module.exports = Base;

var Types = require('./types');

function Base() {
}

Base.prototype._getWkbType = function (options) {
    var flags = (options.postgis ? Types.ewkbFlags : Types.sqlMM3Flags);
    return this._baseWkbType +
        (this.hasM() ? flags.M : 0) +
        (this.hasZ() ? flags.Z : 0);
};
