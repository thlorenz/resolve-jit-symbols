(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){"use strict";var hexAddressRegex=/0x((\d|[abcdefABCDEF]){0,2})+/,lldb_backtraceRegex=/(:?0x((\d|[abcdefABCDEF]){0,2})+) +in +(:?0x((\d|[abcdefABCDEF]){0,2})+)/;function byDecimalAddress(a,b){return a.decimalAddress<b.decimalAddress?-1:1}function processLine(acc,x){if(!x.trim().length)return acc;var parts=x.split(/ +/);if(parts.length<3)return acc;var decimal=parseInt(parts[0],16);var item={address:parts[0],size:parts[1],decimalAddress:decimal,symbol:parts.slice(2).join(" ")};acc.push(item);return acc}function JITResolver(map){if(!(this instanceof JITResolver))return new JITResolver(map);var lines=Array.isArray(map)?map:map.split("\n");this._addresses=lines.reduce(processLine,[]).sort(byDecimalAddress);this._len=this._addresses.length}module.exports=JITResolver;var proto=JITResolver.prototype;proto.resolve=function resolve(hexAddress){var match=null;var a=typeof hexAddress==="number"?hexAddress:parseInt(hexAddress,16);for(var i=0;i<this._len;i++){if(a<this._addresses[i].decimalAddress){match=this._addresses[i-1];break}}return match};function defaultGetHexAddress(line){var m=line.match(hexAddressRegex);if(!m)return null;var matchStackTrace=line.match(lldb_backtraceRegex);var res;if(matchStackTrace){return matchStackTrace[4]}return m&&m[0]}proto.resolveMulti=function resolveMulti(stack,getHexAddress){getHexAddress=getHexAddress||defaultGetHexAddress;var self=this;var isLines=Array.isArray(stack);var lines=isLines?stack:stack.split("\n");function processLine(line){var replacement;var address=getHexAddress(line);if(!address)return line;var resolved=self.resolve(address);if(!resolved)return line;return line.replace(address,resolved.symbol)}var processedLines=lines.map(processLine);return isLines?processedLines:processedLines.join("\n")};proto.hexAddressRegex=hexAddressRegex;proto.lldb_backtraceRegex=lldb_backtraceRegex},{}],2:[function(require,module,exports){},{}],3:[function(require,module,exports){"use strict";var colorNums={white:37,black:30,blue:34,cyan:36,green:32,magenta:35,red:31,yellow:33,brightBlack:90,brightRed:91,brightGreen:92,brightYellow:93,brightBlue:94,brightMagenta:95,brightCyan:96,brightWhite:97},backgroundColorNums={bgBlack:40,bgRed:41,bgGreen:42,bgYellow:43,bgBlue:44,bgMagenta:45,bgCyan:46,bgWhite:47,bgBrightBlack:100,bgBrightRed:101,bgBrightGreen:102,bgBrightYellow:103,bgBrightBlue:104,bgBrightMagenta:105,bgBrightCyan:106,bgBrightWhite:107},colors={};Object.keys(colorNums).forEach(function(k){colors[k]=function(s){return"["+colorNums[k]+"m"+s+"[39m"}});Object.keys(backgroundColorNums).forEach(function(k){colors[k]=function(s){return"["+backgroundColorNums[k]+"m"+s+"[49m"}});module.exports=colors},{}],4:[function(require,module,exports){(function(__dirname){"use strict";var colors=require("ansicolors");var lldbRegex=/^#(:?\d+)\W+(:?0x(?:(?:\d|[abcdefABCDEF]){0,2})+)\W+in\W+(:?.+?)(?:\W+at\W+(:?.+)){0,1}$/m;exports.line=function prettyLine(line,theme){if(!line)throw new Error("Please supply a line");if(!theme)throw new Error("Please supply a theme");if(lldbRegex.test(line)){return line.replace(lldbRegex,function(match,number,address,symbol,location){return theme.number("#"+number)+" "+theme.address(address)+" in "+theme.symbol(symbol)+(location?" at "+theme.location(location):"")})}return theme.raw(line)};exports.lines=function prettyLines(lines,theme){if(!lines||!Array.isArray(lines))throw new Error("Please supply an array of lines");if(!theme)throw new Error("Please supply a theme");function prettify(line){if(!line)return null;return exports.line(line,theme)}return lines.map(prettify)};exports.terminalTheme={raw:colors.brightBlue,number:colors.blue,address:colors.brightBlack,symbol:colors.brightBlue,location:colors.brightBlack};function spanClass(clazz){return function span(x){return'<span class="'+clazz+'">'+x+"</span>"}}exports.htmlTheme={raw:spanClass("trace-raw"),number:spanClass("trace-number"),address:spanClass("trace-address"),symbol:spanClass("trace-symbol"),location:spanClass("trace-location")};var fs=require("fs");if(!module.parent&&typeof window==="undefined"){var lines=fs.readFileSync(__dirname+"/test/fixtures/lldb-trace.txt","utf8").split("\n");var res=exports.lines(lines,exports.terminalTheme);console.log(res.join("\n"))}}).call(this,"/node_modules/pretty-trace")},{ansicolors:3,fs:2}],5:[function(require,module,exports){"use strict";var jitResolver=require("../");var pretty=require("pretty-trace");var resolver,helped=0;var inputfileEl=document.getElementById("inputfile-button"),stackOriginalEl=document.getElementById("stack-original"),stackResolvedEl=document.getElementById("stack-resolved"),addressesDataEl=document.getElementById("hexaddresses"),addressesEl=document.getElementById("input-hexaddress"),resolvedAddressEl=document.getElementById("address-resolved"),helpEl=document.getElementById("help"),instructionsEl=document.getElementsByClassName("instructions")[0];function readFile(file,cb){var fileReader=new FileReader;fileReader.readAsText(file,"utf-8");fileReader.onload=function onload(err){cb(err,fileReader.result)}}function prettyStack(stackLines){var prettyLines=pretty.lines(stackLines,pretty.htmlTheme);return prettyLines.join('<p class="trace-line-break"></p>')}function resolveStack(stack){var res;try{res=resolver.resolveMulti(stack.split("\n"))}catch(e){res=e.toString()}finally{stackResolvedEl.innerHTML=prettyStack(res)}}function fillAddressesList(addresses){addressesDataEl.innerHTML=addresses.map(function(x){return'<option value="'+x.address+'">'})}function onAddress(e){var add=e.target.value;if(!resolver){resolvedAddressEl.value="Please load a map file first";return}var resolved=resolver.resolve(add);var result=resolved&&resolved.symbol||"["+add+"] was not found";resolvedAddressEl.value=result}function onFile(e){var file=e.target.files[0];if(!file)return;readFile(file,function(e){resolver=jitResolver(e.target.result);fillAddressesList(resolver._addresses);if(!stackOriginalEl.value){stackResolvedEl.innerText="Please paste a stack to have its symbols resolved or type hex addresses into the box";return}resolveStack(stackOriginalEl.value)})}function onStack(e){if(!resolver){stackResolvedEl.innerHTML="<p>Please load a map file to resolve symbols for the given stack</p>"+prettyStack(e.target.value.split("\n"));return}resolveStack(e.target.value)}function onHelp(e){instructionsEl.setAttribute("class",helped++%2?"instructions hidden":"instructions")}inputfileEl.addEventListener("change",onFile);stackOriginalEl.addEventListener("input",onStack);addressesEl.addEventListener("input",onAddress);helpEl.addEventListener("click",onHelp)},{"../":1,"pretty-trace":4}]},{},[5]);