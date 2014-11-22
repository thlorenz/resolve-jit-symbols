
'use strict';

var test = require('tap').test
var fs = require('fs');
var jitResolver = require('../')

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var map = fs.readFileSync(__dirname + '/fixtures/jit.map', 'utf8')
  
test('\nresolving from string', function (t) {
  var resolver = jitResolver(map);

  t.deepEqual(
      resolver.resolve(0x38852ffd485a)
    , { address: '38852ffd4640',
        size: '54c',
        decimalAddress: 62144686933568,
        symbol: 'LazyCompile:*go' }
    , 'correctly resolves existing symbol when hex passed as number'
  )

  t.deepEqual(
      resolver.resolve('0x38852ffd485a')
    , { address: '38852ffd4640',
        size: '54c',
        decimalAddress: 62144686933568,
        symbol: 'LazyCompile:*go' }
    , 'correctly resolves existing symbol when hex passed as string'
  )
  t.deepEqual(
      resolver.resolve(0x38852ffd486e)
    , { address: '38852ffd4640',
        size: '54c',
        decimalAddress: 62144686933568,
        symbol: 'LazyCompile:*go' }
    , 'correctly resolves another existing symbol when hex passed as number'
  )

  t.deepEqual(
      resolver.resolve(0x38852ff060a1)
    , { address: '38852ff06060',
        size: 'f5',
        decimalAddress: 62144686088288,
        symbol: 'Stub:CEntryStub' }
    , 'correctly resolves yet another existing symbol when hex passed as number'
  )

  t.equal(resolver.resolve(0x48852ffd485a), null, 'returns null for non-existing symbol')
  t.end()
})
