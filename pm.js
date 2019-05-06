#!/usr/bin/env node
/* global require: true */

// initialize the environment for Node.js
const path = require('path');

const isMain = require.main === module;
// Create a custom require method that adds `lib/jsdoc` and `node_modules` to the module
// lookup path. This makes it possible to `require('jsdoc/foo')` from external templates and
// plugins, and within JSDoc itself. It also allows external templates and plugins to
// require JSDoc's module dependencies without installing them locally.
require = require('requizzle')({
	requirePaths: {
		before: [path.join(__dirname, 'lib'), path.join(__dirname, 'lib/converters')],
		after: [path.join(__dirname, 'node_modules')]
	},
	infect: true
});

if (isMain) {
	require('./cli');
} else {
	module.exports = function (options) {
		const JsDoc = require('./index');

		return new JsDoc(options).runCommand();
	};
}
