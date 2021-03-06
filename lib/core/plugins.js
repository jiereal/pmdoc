/**
 * Utility functions to support the JSDoc plugin framework.
 * @module jsdoc/plugins
 */
const dictionary = require('tag/dictionary');

function addHandlers(handlers, parser) {
	Object.keys(handlers).forEach(eventName => {
		parser.on(eventName, handlers[eventName]);
	});
}

exports.installPlugins = (plugins, parser, options) => {
	let plugin;

	for (let pluginModule of plugins) {
		plugin = require(pluginModule).install(options);

		// allow user-defined plugins to...
		// ...register event handlers
		if (plugin.handlers) {
			addHandlers(plugin.handlers, parser);
		}

		// ...define tags
		if (plugin.defineTags) {
			plugin.defineTags(dictionary);
		}

		// ...add a Mozilla Parser API node visitor
		if (plugin.astNodeVisitor) {
			parser.addAstNodeVisitor(plugin.astNodeVisitor);
		}
	}
};
