/**
 * Make the contents of a README file available to include in the output.
 * @module jsdoc/readme
 */
const fs = require('utils/fs');
const markdown = require('parsers/markdown');

/**
 * Represents a README file.
 */
class ReadMe {
	/**
	 * @param {string} path - The filepath to the README.
	 * @param {object} options
	 */
	constructor(path, options) {
		const content = fs.readFileSync(path, options.encoding);
		const parse = markdown.getParser();

		this.html = parse(content);
	}
}

module.exports = ReadMe;
