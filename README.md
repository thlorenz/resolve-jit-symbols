# resolve-jit-symbols [![build status](https://secure.travis-ci.org/thlorenz/resolve-jit-symbols.png)](http://travis-ci.org/thlorenz/resolve-jit-symbols)

Resolves symbols for dynamic code generated by a JIT via a map file.

```js
var resolveJITSymbols = require('resolve-jit-symbols');
var map = fs.readFileSync(__dirname + '/test/fixtures/jit.map', 'utf8')
  
var resolver = resolveJITSymbols(map);
var res = resolver.resolve('0x38852ffd485a');
console.log(res);
```

```
{ address        : '38852ffd4640',
  size           : '54c',
  decimalAddress : 62144686933568,
  symbol         : 'LazyCompile    : *go' }
```

## Command Line

```sh
cat test/fixtures/callgraph.csv | rjs test/fixtures/jit.map
```

## Installation

    npm install resolve-jit-symbols

## Usage

```
# Supply path to map file
cat callstack.csv | rjs /tmp/<perf-*.map>

# Or pid of process whose map file to use (resolved from /tmp/perf-<pid>.map)
cat callstack.csv | rjs <pid>
```

## How to Generate JIT Symbol Files

Any tool that can generate [the format described
here](https://github.com/torvalds/linux/blob/master/tools/perf/Documentation/jit-interface.txt) will work.

With Node.js `>=v0.11.15` do the following:

```js
node --perf-basic-prof your-app.js
```

This will create a map file at `/tmp/perf-<pid>.map`.

## API

<!-- START docme generated API please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN docme TO UPDATE -->

<div>
<div class="jsdoc-githubify">
<section>
<article>
<div class="container-overview">
<dl class="details">
</dl>
</div>
<dl>
<dt>
<h4 class="name" id="JITResolver::hexAddressRegex"><span class="type-signature"></span>JITResolver::hexAddressRegex<span class="type-signature"></span></h4>
</dt>
<dd>
<div class="description">
<p>RegExp used to match memory addresses.</p>
</div>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/resolve-jit-symbols/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/resolve-jit-symbols/blob/master/index.js#L124">lineno 124</a>
</li>
</ul></dd>
</dl>
</dd>
<dt>
<h4 class="name" id="JITResolver::lldb_backtraceRegex"><span class="type-signature"></span>JITResolver::lldb_backtraceRegex<span class="type-signature"></span></h4>
</dt>
<dd>
<div class="description">
<p>RegExp used to match memory lldb backtraces of the form <code>#1 0x001 in 0x001 ()</code>
When calling <code>var m = s.match(regex)</code>
<code>m[1]</code> contains first matched address and <code>m[2]</code> contains second matched address.</p>
</div>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/resolve-jit-symbols/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/resolve-jit-symbols/blob/master/index.js#L131">lineno 131</a>
</li>
</ul></dd>
</dl>
</dd>
</dl>
<dl>
<dt>
<h4 class="name" id="JITResolver"><span class="type-signature"></span>JITResolver<span class="signature">(map)</span><span class="type-signature"> &rarr; {Object}</span></h4>
</dt>
<dd>
<div class="description">
<p>Instantiates a JIT resolver for the given map.</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>map</code></td>
<td class="type">
<span class="param-type">String</span>
|
<span class="param-type">Array.&lt;String></span>
</td>
<td class="description last"><p>either a string or lines with space separated HexAddress, Size, Symbol on each line</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/resolve-jit-symbols/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/resolve-jit-symbols/blob/master/index.js#L31">lineno 31</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>the initialized JIT resolver</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">Object</span>
</dd>
</dl>
</dd>
<dt>
<h4 class="name" id="JITResolver::resolve"><span class="type-signature"></span>JITResolver::resolve<span class="signature">(hexAddress)</span><span class="type-signature"> &rarr; {Object}</span></h4>
</dt>
<dd>
<div class="description">
<p>Matches the address of the symbol of which the given address is part of.</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>hexAddress</code></td>
<td class="type">
<span class="param-type">String</span>
|
<span class="param-type">Number</span>
</td>
<td class="description last"><p>the hexadecimal address of the address to check</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/resolve-jit-symbols/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/resolve-jit-symbols/blob/master/index.js#L54">lineno 54</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>info of the matching symbol which includes address, size, symbol</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">Object</span>
</dd>
</dl>
</dd>
<dt>
<h4 class="name" id="JITResolver::resolveMulti"><span class="type-signature"></span>JITResolver::resolveMulti<span class="signature">(stack, <span class="optional">getHexAddress</span>)</span><span class="type-signature"> &rarr; {Array.&lt;String>|String}</span></h4>
</dt>
<dd>
<div class="description">
<p>Resolves all symbols in a given stack and replaces them accordingly</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Argument</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>stack</code></td>
<td class="type">
<span class="param-type">Array.&lt;String></span>
|
<span class="param-type">String</span>
</td>
<td class="attributes">
</td>
<td class="description last"><p>string of stack or lines of stack</p></td>
</tr>
<tr>
<td class="name"><code>getHexAddress</code></td>
<td class="type">
<span class="param-type">function</span>
</td>
<td class="attributes">
&lt;optional><br>
</td>
<td class="description last"><p>allows overriding the function used to find a hex address on each line, returns <code>{ address: 0x000, include: true|false }</code></p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/resolve-jit-symbols/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/resolve-jit-symbols/blob/master/index.js#L92">lineno 92</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>the stack with symbols resolved in the same format that the stack was given, either as lines or one string</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">Array.&lt;String></span>
|
<span class="param-type">String</span>
</dd>
</dl>
</dd>
</dl>
</article>
</section>
</div>

*generated with [docme](https://github.com/thlorenz/docme)*
</div>
<!-- END docme generated API please keep comment here to allow auto update -->

## License

MIT
