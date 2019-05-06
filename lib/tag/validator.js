/**
 * @module tag/validator
 * @requires tag/dictionary
 */
const logger = require('utils/logger');

function buildMessage(tagName, {filename, lineno, comment}, desc) {
	let result = `The @${tagName} tag ${desc}. File: ${filename}, line: ${lineno}`;

	if (comment) {
		result += `\n${comment}`;
	}

	return result;
}

/**
 * Validate the given tag.
 */
exports.validate = ({title, text, value}, tagDef, meta) => {
	// todo allowUnknownTags 可配置
	const allowUnknownTags = true;

	// handle cases where the tag definition does not exist
	if (!tagDef) {
		// log an error if unknown tags are not allowed
		if (!allowUnknownTags ||
			(Array.isArray(allowUnknownTags) &&
			!allowUnknownTags.includes(title))) logger.error(buildMessage(title, meta, 'is not a known tag'));

		// stop validation, since there's nothing to validate against
		return;
	}

	// check for errors that make the tag useless
	if (!text && tagDef.mustHaveValue) {
		logger.error(buildMessage(title, meta, 'requires a value'));
	} else if (text && tagDef.mustNotHaveValue) { // check for minor issues that are usually harmless
		logger.warn(buildMessage(title, meta,
			'does not permit a value; the value will be ignored'));
	} else if (value && value.description && tagDef.mustNotHaveDescription) {
		logger.warn(buildMessage(title, meta,
			'does not permit a description; the description will be ignored'));
	}
};
