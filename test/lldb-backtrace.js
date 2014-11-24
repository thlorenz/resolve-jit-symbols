'use strict';

var test = require('tap').test
var fs = require('fs');
var jitResolver = require('../')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var map = fs.readFileSync(__dirname + '/fixtures-backtraces/jit.map', 'utf8')
var backtrace = fs.readFileSync(__dirname + '/fixtures-backtraces/stack.txt', 'utf8')
var resolved = fs.readFileSync(__dirname + '/fixtures-backtraces/resolved.txt', 'utf8')

test('\nresolving lldb-backtrace', function (t) {
  var resolver = jitResolver(map)
  var res = resolver.resolveMulti(backtrace)
  t.equal(res, resolved, 'resolves symbols properly while maintaining backtrace format')
  t.end()
})
