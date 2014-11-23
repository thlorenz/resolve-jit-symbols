'use strict';
/*jshint browser:true*/

var jitResolver = require('../');
var resolver, helped = 0;

var inputfileEl       = document.getElementById('inputfile-button')
  , stackOriginalEl   = document.getElementById('stack-original')
  , stackResolvedEl   = document.getElementById('stack-resolved')
  , addressesDataEl   = document.getElementById('hexaddresses')
  , addressesEl       = document.getElementById('input-hexaddress')
  , resolvedAddressEl = document.getElementById('address-resolved')
  , helpEl            = document.getElementById('help')
  , instructionsEl    = document.getElementsByClassName('instructions')[0]


function readFile(file, cb) {
  var fileReader = new FileReader();
  fileReader.readAsText(file, 'utf-8');
  fileReader.onload = function onload(err) {
    cb(err, fileReader.result);
  }
}

function resolveStack(stack) {
  var res;
  try {
    res = resolver.resolveMulti(stack);
  } catch(e) {
    res = e.toString();
  } finally {
    stackResolvedEl.innerText = res;
  }
}

function fillAddressesList(addresses) {
  addressesDataEl.innerHTML = addresses
    .map(function (x) { return '<option value="' + x.address + '">' })
}

function onAddress(e) {
  var add = e.target.value;
  if (!resolver) {
    resolvedAddressEl.value = 'Please load a map file first';
    return;
  }
  var resolved = resolver.resolve(add);
  var result = resolved && resolved.symbol || '[' + add + '] was not found';
  resolvedAddressEl.value = result;
}

function onFile(e) {
  var file = e.target.files[0];
  if (!file) return;
  readFile(file, function (e) {
    resolver = jitResolver(e.target.result);
    fillAddressesList(resolver._addresses);
    if (!stackOriginalEl.value) {
      stackResolvedEl.innerText = 'Please paste a stack to have its symbols resolved or type hex addresses into the box';
      return;
    }

    resolveStack(stackOriginalEl.value);
  })
}

function onStack(e) {
  if (!resolver) {
    stackResolvedEl.innerText = 'Please load a map file to resolve symbols from the given stack';
    return;
  }
  resolveStack(e.target.value);
}

function onHelp(e) {
  instructionsEl.setAttribute('class', helped++ % 2 ? 'instructions hidden' : 'instructions')
}

// Event Listeners
inputfileEl.addEventListener('change', onFile);
stackOriginalEl.addEventListener('input', onStack)
addressesEl.addEventListener('input', onAddress)
helpEl.addEventListener('click', onHelp);
