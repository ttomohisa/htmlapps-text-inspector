'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../src/index.template.html'),'utf8');
test('phone informational footer and equivalent local label',()=>{assert.ok(html.includes('@media (max-width: 620px) { body > footer { display: none; } }'));assert.ok(html.includes("localBadge: 'Fully local processing'"));});
test('populated version is unique at the end of Help',()=>{const h=html.match(/<dialog id="helpDialog"[^]*?<\/dialog>/)[0];assert.match(h,/<p class="help-build"><span id="buildInfo">v\{\{VERSION\}\} · \{\{BUILD_TIMESTAMP\}\}<\/span><\/p>\s*<\/div>\s*<\/dialog>$/);assert.equal((html.match(/id="buildInfo"/g)||[]).length,1);});
