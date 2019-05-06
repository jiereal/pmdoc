/**
 * @module Collection
 * @type {v1}
 */
const uuid = require('uuid/v1');

/**
 * postmanDefine 对应的name
 * @typedef DocKeys
 * @type {{FormData: string, CollectionRequest: string, CollectionAuth: string, CollectionProxy: string, CollectionEvent: string, CollectionCertificate: string, CollectionResponse: string, UrlEncodedParameter: string, CollectionScript: string, CollectionItemFolder: string, CollectionFile: string, CollectionRequestBody: string, CollectionRequestHeader: string, Collection: string, CollectionItem: string, CollectionVariable: string, CollectionCookie: string}}
 */
exports.DocKeys = {
	Collection: 'collection',
	CollectionItem: 'item',
	CollectionItemFolder: 'folder',
	CollectionEvent: 'event',
	CollectionScript: 'script',
	CollectionRequest: 'request',
	CollectionRequestBody: 'requestbody',
	CollectionFile: 'file',
	FormData: 'formdata',
	UrlEncodedParameter: 'urlPara',
	CollectionProxy: 'proxy',
	CollectionCertificate: 'certificate',
	CollectionRequestHeader: 'header',
	CollectionResponse: 'response',
	CollectionCookie: 'cookie',
	CollectionAuth: 'auth',
	CollectionVariable: 'variable',
	CollectionDescription: 'description'
};

class Base {
	setProperty(key, value) {
		this.key = value;
	}
}

/**
 * @class
 * @memberOf Collection
 */
class Collection extends Base {
	/**
	 * postman collection constructor
	 * @param {CollectionInfo} info
	 * @param {CollectionItem[]} item
	 * @param {CollectionEvent[]} event
	 * @param {CollectionVariable[]} variable
	 * @param {?CollectionAuth} auth
	 * @param {*} protocolProfileBehavior
	 */
	constructor({info = {}, item = [], event = [], auth = null, variable = [], protocolProfileBehavior = null} = {}) {
		super();
		this.info = new CollectionInfo(info);
		this.item = item.map((i) => new CollectionItem(i));
		this.event = event.map((i) => new CollectionEvent(i));
		this.variable = variable.map(i => new CollectionVariable(i));
		if (auth) {
			this.auth = new CollectionAuth(auth);
		}
		this.protocolProfileBehavior = protocolProfileBehavior;
	}

	setProperty(key, value) {
		switch (key) {
			case 'name':
			case 'description':
			case 'schema':
				this.info.setProperty(key, value);
				break;
			default:
				super.setProperty(key, value);
		}
	}
}

exports.Collection = Collection;

/**
 * @class
 * @memberOf Collection
 */
class CollectionInfo extends Base {
	constructor({name = '', description = '', version = ''} = {}) {
		super();
		this.name = name;
		this._postman_id = uuid();
		this.description = description;
		this.version = version;
		this.schema = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';
	}

	setProperty() {
		super.setProperty();
	}
}

exports.CollectionInfo = CollectionInfo;

/**
 * @class
 * @memberOf Collection
 */
class CollectionItem extends Base {
	/**
	 *
	 * @param {string} name=""
	 * @param {string} description
	 * @param {CollectionVariable[]} variable
	 * @param {CollectionEvent[]} event
	 * @param {CollectionRequest} request
	 * @param {CollectionResponse[]} response
	 * @param {*} protocolProfileBehavior
	 */
	constructor(
		{
			name = '',
			description = '',
			variable = [],
			event = [],
			request = {},
			response = [],
			protocolProfileBehavior = null
		} = {}
	) {
		super();
		this.id = uuid();
		this.name = name;
		this.description = description;
		this.variable = variable.map(i => new CollectionVariable(i));
		this.event = event.map(i => new CollectionEvent(i));
		this.request = new CollectionRequest(request);
		this.response = response.map(i => new CollectionResponse(i));
		this.protocolProfileBehavior = protocolProfileBehavior;
	}
}

exports.CollectionItem = CollectionItem;

/**
 * @class
 * @memberOf Collection
 */
class CollectionItemFolder extends Base {
	/**
	 * @param {string} id
	 * @param {string} name
	 * @param {string} description
	 * @param {CollectionVariable[]} variable
	 * @param {CollectionEvent[]} event
	 * @param {CollectionItem[]} item
	 * @param {*} protocolProfileBehavior
	 */
	constructor(
		{
			id = uuid(),
			name = '',
			description = '',
			variable = [],
			event = [],
			item = [],
			protocolProfileBehavior = null
		} = {}
	) {
		super();
		this.id = id;
		this.name = name;
		this.description = description;
		this.variable = variable.map(i => new CollectionVariable(i));
		this.event = event.map(i => new CollectionEvent(i));
		this.item = item.map(i => new CollectionItem(i));
		this.protocolProfileBehavior = protocolProfileBehavior;
	}
}

exports.CollectionItemFolder = CollectionItemFolder;

/**
 * @class
 * @memberOf Collection
 */
class CollectionEvent extends Base {
	/**
	 * 绑定事件 test | prerequest
	 * @param {string} id=uuid()
	 * @param {{'test' | 'prerequest'}} listen - test | prerequest
	 * @param script
	 * @param disabled
	 */
	constructor(
		{
			id = uuid(),
			listen = '',
			script = '',
			disabled = false
		} = {}
	) {
		super();
		this.id = id;
		this.listen = listen;
		this.script = new CollectionScript(script);
		this.disabled = disabled;
	}
}

exports.CollectionEvent = CollectionEvent;

class CollectionScript extends Base {
	/**
	 * @param {string} id
	 * @param {string} type - exp: text/javascript
	 * @param {string[]} exec
	 * @param {string} src
	 * @param {string} name
	 */
	constructor(
		{
			id = uuid(),
			type = 'text/javascript',
			exec = [],
			src = '',
			name = ''
		} = {}
	) {
		super();
		this.id = id;
		this.type = type;
		if (exec.length) {
			this.exec = exec;
		} else {
			this.src = src;
		}
		this.name = name;
	}
}

exports.CollectionScript = CollectionScript;

/**
 * @typedef RequestMethod
 * @value GET
 * @value PUT
 * @value POST
 * @value PATCH
 * @value DELETE
 * @value COPY
 * @value HEAD
 * @value OPTIONS
 * @value LINK
 * @value UNLINK
 * @value PURGE
 * @value LOCK
 * @value UNLOCK
 * @value PROPFIND
 * @value VIEW
 */
/**
 * @class
 * @memberOf Collection
 */
class CollectionRequest extends Base {
	/**
	 *
	 * @param {string} url
	 * @param {?CollectionAuth} auth
	 * @param {CollectionProxy} proxy
	 * @param certificate
	 * @param {RequestMethod} method
	 * @param description
	 * @param {CollectionRequestHeader} header
	 * @param {CollectionRequestBody} body
	 */
	constructor(
		{
			url = '',
			auth = null,
			proxy = null,
			certificate = null,
			method = 'GET',
			description = '',
			headers = [],
			body = {}
		} = {},
	) {
		super();
		this.url = url;
		this.auth = auth && new CollectionAuth(auth);
		this.proxy = proxy && new CollectionProxy(proxy);
		this.certificate = certificate && new CollectionCertificate(certificate);
		this.method = method;
		this.description = description;
		this.header = headers.map(h => new CollectionRequestHeader(h));
		this.body = body;
	}
}

exports.CollectionRequest = CollectionRequest;

/**
 * @class
 * @memberOf Collection
 */
class CollectionRequestBody extends Base {
	/**
	 *
	 * @param {raw | urlencoded | formdata | file | disabled} mode
	 * @param raw
	 * @param urlencoded
	 * @param formdata
	 * @param file
	 * @param disabled
	 */
	constructor(
		{
			mode = 'raw',
			raw = undefined,
			urlencoded = undefined,
			formdata = undefined,
			file = undefined,
			disabled = false
		} = {}
	) {
		super();
		this.mode = mode;
		switch (mode) {
			case 'raw':
				this.raw = raw;
				break;
			case 'urlencoded':
				this.urlencoded = urlencoded && urlencoded.map(i => new UrlEncodedParameter(i));
				break;
			case 'formdata':
				this.formdata = formdata && formdata.map(i => new FormParameter(i));
				break;
			case 'file':
				this.file = file && new CollectionFile(file);
		}

		this.disabled = disabled;
	}
}

exports.CollectionRequestBody = CollectionRequestBody;

class CollectionFile extends Base {
	/**
	 * @param {string} src
	 * @param {string} content
	 */
	constructor({src = '', content = ''} = {}) {
		super();
		this.src = src;
		this.content = content;
	}
}

exports.CollectionFile = CollectionFile;

/**
 * @class
 * @memberOf Collection
 */
class FormParameter extends Base {
	constructor({key = '', value = '', type = ''} = {}) {
		super();
		this.key = key;
		this.value = value;
		this.type = type;
	}
}

exports.FormParameter = FormParameter;

/**
 * @class
 * @memberOf Collection
 */
class UrlEncodedParameter extends Base {
	constructor(
		{
			key = '',
			value = '',
			disabled = false,
			description = ''
		} = {}
	) {
		super();
		this.key = key;
		this.value = value;
		this.disabled = disabled;
		this.description = description;
	}
}

exports.UrlEncodedParameter = UrlEncodedParameter;

/**
 * @class
 * @memberOf Collection
 */
class CollectionProxy extends Base {
	/**
	 * @param {string} match=http+https:\/\/*\/*
	 * @param {string} host
	 * @param {string} port=8080
	 * @param {boolean} tunnel=false
	 * @param {boolean} disabled=false
	 */
	constructor(
		{
			match = 'http+https://*/*',
			host = '',
			port = '8080',
			tunnel = false,
			disabled = false
		} = {}
	) {
		super();
		this.match = match;
		this.host = host;
		this.port = port;
		this.tunnel = tunnel;
		this.disabled = disabled;
	}
}

exports.CollectionProxy = CollectionProxy;

/**
 * @class
 * @memberOf Collection
 */
class CollectionCertificate extends Base {
	/**
	 * @param {string} name
	 * @param {string[]} matches
	 * @param {{src: string} | null} key - An object containing path to file containing private key, on the file system
	 * @param {{src: string} | null} cert - An object containing path to file certificate, on the file system
	 * @param {string} passphrase
	 */
	constructor(
		{
			name = '',
			matches = [],
			key = null,
			cert = null,
			passphrase = ''
		} = {}
	) {
		super();
		this.name = name;
		this.matches = matches;
		this.key = key;
		this.cert = cert;
		this.passphrase = passphrase;
	}
}

exports.CollectionCertificate = CollectionCertificate;

/**
 * @class
 * @memberOf Collection
 */
class CollectionRequestHeader extends Base {
	/**
	 * @param {string} key
	 * @param {string} value
	 * @param {boolean} disabled=false
	 * @param {string} description
	 */
	constructor({key = '', value = '', disabled = false, description = ''} = {}) {
		super();
		this.key = key;
		this.value = value;
		this.disabled = disabled;
		this.description = description;
	}
}

exports.CollectionRequestHeader = CollectionRequestHeader;

/**
 * @class
 * @memberOf Collection
 */
class CollectionResponse extends Base {
	/**
	 *
	 * @param {?CollectionRequest} originalRequest
	 * @param {?string|number}responseTime
	 * @param {?object} timings
	 * @param {?CollectionRequestHeader[]} header
	 * @param {CollectionCookie[]} cookie
	 * @param {?string} body
	 * @param {string} status
	 * @param {number} code
	 */
	constructor(
		{
			originalRequest = null,
			responseTime = null,
			timings = null,
			header,
			cookie,
			body = '',
			status = '',
			code = -1
		} = {}
	) {
		super();
		this.originalRequest = new CollectionRequest(originalRequest);
		this.responseTime = responseTime;
		this.timings = timings;
		this.header = header && header.map(i => new CollectionRequestHeader(i));
		this.cookie = cookie && cookie.map(i => new CollectionCookie(i));
		this.body = body;
		this.status = status;
		this.code = code;
	}
}

exports.CollectionResponse = CollectionResponse;

/**
 * @class
 * @memberOf Collection
 */
class CollectionCookie extends Base {
	/**
	 * @link https://developer.chrome.com/extensions/cookies
	 * @param domain
	 * @param expires
	 * @param maxAge
	 * @param hostOnly
	 * @param name
	 * @param path
	 * @param secure
	 * @param session
	 * @param value
	 * @param extensionsarray
	 */
	constructor({domain = '', expires = '', maxAge = '', hostOnly = false, name = '', path = '', secure = 'true', session = false, value = '', extensionsarray = []} = {}) {
		super();
		this.domain = domain;
		this.expires = expires;
		this.maxAge = maxAge;
		this.hostOnly = hostOnly;
		this.name = name;
		this.path = path;
		this.secure = secure;
		this.session = session;
		this.value = value;
		this.extensionsarray = extensionsarray;
	}
}

exports.CollectionCookie = CollectionCookie;

/**
 * @typedef CollectionAuthTypes
 * @readonly
 * @enum {string}
 */
const CollectionAuthTypes = {
	apikey: 'apikey',
	awsv4: 'awsv4',
	basic: 'basic',
	bearer: 'bearer',
	digest: 'digest',
	hawk: 'hawk',
	noauth: 'noauth',
	oauth1: 'oauth1',
	oauth2: 'oauth2',
	ntlm: 'ntlm',
};

exports.CollectionAuthTypes = CollectionAuthTypes;

/**
 * @class
 * @memberOf Collection
 */
class CollectionAuth extends Base {
	/**
	 *
	 * @param {CollectionAuthTypes} type
	 * @param {?array} noauth
	 * @param {?array} apikey
	 * @param {?array} awsv4
	 * @param {?array} basic
	 * @param {?array} bearer
	 * @param {?array} digest
	 * @param {?array} hawk
	 * @param {?array} ntlm
	 * @param {?array} oauth1
	 * @param {?array} oauth2
	 */
	constructor(
		{
			type = '',
			noauth,
			apikey,
			awsv4,
			basic,
			bearer,
			digest,
			hawk,
			ntlm,
			oauth1,
			oauth2
		} = {}
	) {
		super();
		this.type = type;
		if (noauth && noauth.length) {
			this.noauth = noauth;
		}
		if (apikey && apikey.length) {
			this.apikey = apikey;
		}
		if (awsv4 && awsv4.length) {
			this.awsv4 = awsv4;
		}
		if (basic && basic.length) {
			this.basic = basic;
		}
		if (bearer && bearer.length) {
			this.bearer = bearer;
		}
		if (digest && digest.length) {
			this.digest = digest;
		}
		if (hawk && hawk.length) {
			this.hawk = hawk;
		}
		if (oauth1 && oauth1.length) {
			this.oauth1 = oauth1;
		}
		if (oauth2 && oauth2.length) {
			this.oauth2 = oauth2;
		}
		if (ntlm && ntlm.length) {
			this.ntlm = ntlm;
		}
	}
}

exports.CollectionAuth = CollectionAuth;

/**
 * @class
 * @memberOf Collection
 */
class CollectionVariable extends Base {
	/**
	 * @typedef CollectionVariableTypes
	 * @enum
	 */
	static get CollectionVariableTypes() {
		return {
			string: 'string',
			boolean: 'boolean',
			any: 'any',
			number: 'number'
		};
	}

	/**
	 *
	 * @param key=""
	 * @param value=""
	 * @param {CollectionVariableTypes} type=string
	 * @param {string} name=""
	 * @param {string} description=""
	 * @param {boolean} system=false
	 * @param {boolean} disabled=false
	 */
	constructor(
		{
			key = '',
			value = '',
			type = 'string',
			name = '',
			description = '',
			system = false,
			disabled = false
		} = {}
	) {
		super();
		this.key = key;
		this.value = value;
		this.type = type;
		this.name = name;
		this.description = description;
		this.system = system;
		this.disabled = disabled;
	}
}

exports.CollectionVariable = CollectionVariable;

class CollectionDescription extends Base {
	/**
	 *
	 * @param content - a raw string
	 * @param type - Holds the mime type of the raw description content. E.g: 'text/markdown' or 'text/html'.
	 The type is used to correctly render the description when generating documentation, or in the Postman app.
	 * @param version
	 */
	constructor(
		{
			content = '',
			type = '',
			version = ''
		} = {}
	) {
		super();
		this.content = content;
		this.type = type;
		this.version = version;
	}
}

exports.CollectionDescription = CollectionDescription;

function parseUrl(raw) {
	const portReg = /:(\d+)/;
	const pathReg = /(?:\/).[^?#]*/;
	const queryReg = /\?[^#]*/;
	const hashReg = /#.*$/;
	const hostReg = /[{}_\-0-9a-zA-Z.]*/;
	let hash = raw.match(hashReg);
	if (hash) {
		hash = hash[0];
		raw = raw.replace(hash, '');
	}
	let query = raw.match(queryReg);
	if (query) {
		query = query[0];
		raw = raw.replace(query, '');
	}
	let path = raw.match(pathReg);
	if (path) {
		raw = raw.replace(path[0], '');
		if (path[0].startsWith('/')) path[0] = path[0].slice(1);
		path = path[0].split('/');
	}
	let port = raw.match(portReg);
	if (port) {
		raw = raw.replace(port[0], '');
		port = port[1];
	}
	let host = raw.match(hostReg);
	if (host) {
		host = host[0];
		raw = raw.replace(host, '');
	}
	let protocol = raw.replace('://', '');
	return {
		protocol,
		host: [host],
		path,
		query: query && query.split('&').map((s) => {
			const str = s.split('=');
			return {
				key: str[0],
				value: str[1]
			};
		}),
		hash,
		port
	};
}

class Url {
	/**
	 * 解析url
	 * @param {string} raw
	 */
	constructor(raw) {
		this.raw = raw;
		try {
			const {protocol, host, port, path, query, hash} = parseUrl(raw);
			this.protocol = protocol;
			this.path = path;
			this.port = port;
			this.query = query;
			this.hash = hash;
			this.variable = [];
			this.host = host;
		} catch (e) {
			console.log(e);
			this.protocol = '';
			this.path = '';
			this.port = '';
			this.query = [];
			this.hash = '';
			this.variable = [];
			this.host = '';
		}
	}

	// todo  解析变量 {{hostname}}/path
	parse(raw) {

	}
}

exports.Url = Url;

class QueryParam {
	constructor({key = '', value = ''} = {}) {
		this.key = key;
		this.value = value;
	}
}

exports.QueryParam = QueryParam;
