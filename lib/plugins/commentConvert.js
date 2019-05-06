/* eslint-disable spaced-comment */
/**
 * Demonstrate how to modify the source code before the parser sees it.
 *
 * @module plugins/commentConvert
 */

module.exports = {
	/**
	 * @param {object} options
	 * @returns {{beforeParse(*): void}}
	 */
	install(options) {
		return {
			handlers: {
				///
				/// Convert ///-style comments into jsdoc comments.
				/// @param e
				/// @param e.filename
				/// @param e.source
				///
				beforeParse(e) {
					e.source = e.source.replace(/(\n[ \t]*\/\/\/[^\n]*)+/g, $ => {
						return `\n/**${$.replace(/^[ \t]*\/\/\//mg, '').replace(/(\n$|$)/, '*/$1')}`;
					});
				}
			}
		};
	}
};
