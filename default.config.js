module.exports = {
	'tags': {
		'allowUnknownTags': true,
		'dictionaries': ['jsdoc', 'closure']
	},
	'source': {
		'includePattern': '.+\\.js(doc|x)?$',
		'excludePattern': '(^|\\/|\\\\)_'
	},
	'plugins': ['postman'],
	'templates': {
		'cleverLinks': false,
		'monospaceLinks': false,
		'default': {
			'outputSourceFiles': true
		}
	},
	'recurse': false,
	'recurseDepth': 10,
	'sourceType': 'module',
	'destination': './out/',
	'encoding': 'utf8',
	'package': '',
	'readme': '',
	'tutorials': false,
	'template': 'default'
};
