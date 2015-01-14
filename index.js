'use strict';
var prettyTrace = require('pretty-trace');

var instrumentsCsvRegex = prettyTrace.regexes.instruments.csv.regex;


var hexAddressRegex = /0x([0-9A-Fa-f]{2,12})/
  , lldb_backtraceRegex = /(:?0x(?:(?:\d|[abcdefABCDEF]){0,2})+) +in +(:?0x(?:(?:\d|[abcdefABCDEF]){0,2})+)/
// TODO:  faster IMO, not working currently ATM
//  , lldb_backtraceRegex = /0x[0-9A-Fa-f]{2,12} +in 0x[0-9A-Fa-f]{2,12}/

function byDecimalAddress(a, b) {
  return a.decimalAddress < b.decimalAddress ? -1 : 1;
}

function processLine(acc, x) {
  if (!x.trim().length) return acc;

  var parts = x.split(/ +/);
  if (parts.length < 3) return acc;

  var decimal = parseInt(parts[0], 16)

  var item = { 
      address        : parts[0]
    , size           : parts[1]
    , decimalAddress : decimal
    , symbol         : parts.slice(2).join(' ') }

  acc.push(item);
  return acc;
}

/**
 * Instantiates a JIT resolver for the given map.
 * 
 * @name JITResolver
 * @function
 * @param {String|Array.<String>} map either a string or lines with space separated HexAddress, Size, Symbol on each line
 * @return {Object} the initialized JIT resolver
 */
function JITResolver(map) {
  if (!(this instanceof JITResolver)) return new JITResolver(map);
  
  var lines = Array.isArray(map) ? map : map.split('\n')
  this._addresses = lines
    .reduce(processLine, [])
    .sort(byDecimalAddress)

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
 * @param {String|Number} hexAddress the hexadecimal address of the address to check
 * @return {Object} info of the matching symbol which includes address, size, symbol
 */
proto.resolve = function resolve(hexAddress) {
  var match = null;
  var a = typeof hexAddress === 'number' ? hexAddress : parseInt(hexAddress, 16);

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

function defaultGetHexAddress(line) {
  var m = line.match(hexAddressRegex);
  if (!m) return null;
  
  var matchStackTrace = line.match(lldb_backtraceRegex);
  var res;
  if (matchStackTrace) { 
    // lldb backtrace
    return { address: matchStackTrace[2], include: false }
  }
  var include = !instrumentsCsvRegex.test(line);

  return m && { address: m[0], include: include }
}

/**
 * Resolves all symbols in a given stack and replaces them accordingly
 * 
 * @name JITResolver::resolveMulti
 * @function
 * @param {Array.<String>|String} stack string of stack or lines of stack
 * @param {function=} getHexAddress allows overriding the function used to find a hex address on each line, returns `{ address: 0x000, include: true|false }`
 * @return {Array.<String>|String} the stack with symbols resolved in the same format that the stack was given, either as lines or one string
 */
proto.resolveMulti = function resolveMulti(stack, getHexAddress) {
  getHexAddress = getHexAddress || defaultGetHexAddress;
  var self = this;

  var isLines = Array.isArray(stack)
  var lines = isLines ? stack : stack.split('\n')

  function processLine(line) {
    var replacement;
    var match = getHexAddress(line);
    if (!match || !match.address) return line;

    var resolved = self.resolve(match.address);
    if (!resolved) return line;

    return line.replace(match.address, match.include ? match.address + ' ' + resolved.symbol : resolved.symbol);
  }
  
  var processedLines = lines.map(processLine);

  return isLines ? processedLines : processedLines.join('\n');
}

/**
 * RegExp used to match memory addresses.
 * 
 * @name JITResolver::hexAddressRegex
 */
proto.hexAddressRegex  = hexAddressRegex;

/**
 * RegExp used to match memory lldb backtraces of the form `#1 0x001 in 0x001 ()`
 * When calling `var m = s.match(regex)` 
 * `m[1]` contains first matched address and `m[2]` contains second matched address.
 * 
 * @name JITResolver::lldb_backtraceRegex
 */
proto.lldb_backtraceRegex = lldb_backtraceRegex;
