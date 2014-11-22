'use strict';

/**
 * Instantiates a JIT resolver for the given map.
 * 
 * @name JITResolver
 * @function
 * @param {String} map with space separated HexAddres, Size, Symbol on each line
 * @return {Object} the initialized JIT resolver
 */
function JITResolver(map) {
  if (!(this instanceof JITResolver)) return new JITResolver(map);
  
  var lines = map.split('\n')
  this._addresses = lines
    .reduce(function processLine(acc, x) {
      if (!x.trim().length) return acc;

      var parts = x.split(/ +/);
      if (parts.length < 3) return acc;

      var decimal = parseInt(parts[0], 16)

      return acc.concat(
        { address        : parts[0]
        , size           : parts[1]
        , decimalAddress : decimal
        , symbol         : parts[2]
        }
      )
    }, [])

  this._len = this._addresses.length;
}

module.exports = JITResolver;

var proto = JITResolver.prototype;

/**
 * Matches the address of the symbol of which the given address is part of.
 * 
 *
 * @name JITResolver::resolve
 * @function
 * @param {String} hexAddress the hexadecimal address of the address to check
 * @return {Object} info of the matching symbol which includes address, size, symbol
 */
proto.resolve = function resolve(hexAddress) {
  var match = null;
  var a = parseInt(hexAddress, 16);

  for (var i = 0; i < this._len; i++) {
    // once we hit a larger address that means our symbol/function that this
    // address is part of starts at the previous address
    if(a < this._addresses[i].decimalAddress) { 
      match = this._addresses[i - 1];
      break;
    }
  }
  return match;
}
