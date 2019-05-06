const Schema = require('postman/schema');
const DocKeys = require('postman/schema').DocKeys;
const deepmerge = require('deepmerge');
const logger = require('utils/logger');

/**
 * 配置postman tags definations
 */

function parserMultiline(text) {
	const lines = text.split(/[\t\n]+/).map(i => i.trim());
	return lines.map((i) => {
		const trimStr = i.trim();
		const matched = trimStr.match(/^([^=: ]+) ?[=:]/);
		if (matched) {
			const key = matched[1];
			const value = trimStr.replace(matched[0], '').trim();
			return {
				key,
				value
			};
		}
		return false;
	}).filter(i => i);
}

/**
 * 解析单个表达式
 * @param text
 */
function parseSingleExp(text) {
	const nameOrValue = text.split(/\s*=\s*/);

	if (nameOrValue.length === 1) {
		return {
			leftExp: nameOrValue[0].replace(/(var|const|let)?\s*/, ''),
			rightExp: null
		};
	} else {
		return {
			leftExp: nameOrValue[0].replace(/(var|const|let)?\s*/, ''),
			rightExp: nameOrValue[1]
		};
	}
}

function setDef(doclet, value) {
	doclet.pmDef = deepmerge(doclet.pmDef || {}, value);
}

function getObjWithKeys(obj, keys) {
	if (typeof keys === 'string') {
		keys = keys.split('.');
	}
	return keys.reduce((pre, next) => {
		return pre && pre[next];
	}, obj);
}

const setProperty = exports.setProperty = function (doclet, value) {
	const pmDef = doclet.pmDef;
	const postmanType = pmDef && pmDef.type;
	const {name, description} = value;
	switch (postmanType) {
		case DocKeys.Collection: // 设置collection的属性
			if (['description', 'schema'].indexOf(name) !== -1) {
				setDef(doclet, {
					pmData: {
						info: {
							[name]: description
						}
					}
				});
			} else {
				setDef(doclet, {
					pmData: {
						[name]: description
					}
				});
			}
			break;
		case DocKeys.CollectionItem:
		case DocKeys.CollectionItemFolder:
		case DocKeys.CollectionEvent:
			setDef(doclet, {
				pmData: {
					[name]: description
				}
			});

			break;
		default:
			doclet.properties = doclet.properties || [];
			doclet.properties.push(value);
	}
};

const tags = {
	pmDefine: {
		mustHaveValue: true,
		canHaveName: true,
		onTagged(doclet, {originalTitle, value}) {
			const name = value.name;
			const description = value.description;
			switch (name) {
				// 定义变量
				case DocKeys.CollectionVariable:
					const {leftExp, rightExp} = parseSingleExp(description);
					doclet.name = leftExp;
					setDef(doclet, {
						type: DocKeys.CollectionVariable,
						pmData: [
							new Schema.CollectionVariable({
								key: leftExp,
								value: rightExp
							})
						]
					});
					break;
				case DocKeys.Collection:
					doclet.name = description;
					setDef(doclet, {
						type: DocKeys.Collection,
						pmData: {
							info: {
								name: description
							},
							item: []
						}
					});
					break;
				case DocKeys.CollectionItem:
					doclet.name = description;
					setDef(doclet, {
						type: DocKeys.CollectionItem,
						name: description,
						pmData: {
							request: {
								method: 'GET'
							}
						}
					});
					break;
				case DocKeys.CollectionItemFolder:
					doclet.name = description;
					setDef(doclet, {
						type: DocKeys.CollectionItem,
						name: description,
						pmData: {
							item: []
						}
					});
				default:
					doclet.name = description;
					setDef(doclet, {
						type: name,
						name: description
					});
					break;
			}
			doclet.kind = originalTitle;
		}
	},
	/**
	 * 覆盖内置的property
	 */
	property: {
		mustHaveValue: true,
		canHaveType: true,
		canHaveName: true,
		onTagged(doclet, {value}) {
			setProperty(doclet, {
				name: value.name,
				description: value.description
			});
		},
		synonyms: ['prop']
	},
	pmBefore: {
		mustHaveValue: true,
		onTagged(doclet, {value}) {
			setDef(doclet, {
				pmBefore: value.split(',')
			});
		}
	},
	pmTest: {
		onTagged(doclet, tag) {
			const exec = tag.value.split(/[\t\n]+/).map(i => i.trim());
			setDef(doclet, {
				pmData: {
					event: [new Schema.CollectionEvent({listen: 'test', script: {exec}})]
				}
			});
		}
	},
	pmPreRequest: {
		onTagged(doclet, tag) {
			const exec = tag.value.split(/[\t\n]+/).map(i => i.trim());
			setDef(doclet, {
				pmData: {
					event: [new Schema.CollectionEvent({listen: 'prerequest', script: {exec}})]
				}
			});
		}
	},
	pmHeaders: {
		mustHaveValue: true,
		onTagged(doclet, {value}) {
			setDef(doclet, {
				pmData: {
					request: {
						header: parserMultiline(value)
					}
				}
			});
		}
	},
	pmUrl: {
		mustHaveValue: true,
		onTagged(doclet, {value}) {
			setDef(doclet, {
				pmData: {
					request: {
						url: new Schema.Url(value)
					}
				}
			});
		}
	},
	pmBody: {
		canHaveName: true,
		onTagged(doclet, tag) {
			// raw | urlencoded | formdata | file
			let name = tag.value.name;
			let description = tag.value.description;
			if (name === '') {
				name = 'raw'; // 默认
				description = tag.text;
			}
			// 表单解析参数

			if (name === 'urlencoded' || name === 'formdata') {
				description = parserMultiline(description);
			}

			if (name.indexOf('raw') !== -1) { // 当数据为raw文本时, raw = {raw, raw|text,raw|text/plian, raw|application/json, raw|application/javascript, raw|application/xml, raw|text/xml, raw|text/html}
				const type = name.split('|')[1] || 'text';
				const headers = getObjWithKeys(doclet, 'pmDef.pmData.request.headers') || [];
				const index = headers.findIndex(({key}) => key.toLowerCase() === 'content-type');
				let target = {key: 'Content-Type', value: ''};
				if (index !== -1) {
					target = headers[index];
				}
				switch (type) {
					default:
					case 'text':
						setDef(doclet, {
							pmData: {
								request: {
									header: index === -1 ? headers : headers.splice(index, 1)
								}
							}
						});
						break;
					case 'text/plain':
					case 'application/json':
					case 'application/javascript':
					case 'application/xml':
					case 'text/xml':
					case 'text/html':
						target.value = type;
						setDef(doclet, {
							pmData: {
								request: {
									header: headers.splice(index, 1, target)
								}
							}
						});
				}
			}

			setDef(doclet, {
				pmData: {
					request: {
						body: new Schema.CollectionRequestBody({
							mode: name,
							[name]: description
						})
					}
				}
			});
		}
	},
	// todo
	pmResponse: {},
	pmItemOf: {
		mustHaveValue: true,
		onTagged(doclet, {value}) {
			setDef(doclet, {
				itemOf: value
			});
		}
	},
	pmQueries: {
		mustHaveValue: true,
		onTagged(doclet, {value}) {
			const keys = parserMultiline(value);
			const raw = getObjWithKeys(doclet, ['pmDef', 'pmData', 'request', 'url', 'raw']) || '';
			setDef(doclet, {
				pmData: {
					request: {
						url: {
							raw: raw + '?' + keys.reduce((search, next) => search + next.key + '=' + next.value + '&', '').slice(0, -1),
							query: keys
						}
					}
				}
			});
		}
	},
	pmMethod: {
		mustHaveValue: true,
		onTagged(doclet, {value}) {
			setDef(doclet, {
				pmData: {
					request: {
						method: value
					}
				}
			});
		}
	},
	pmClone: {
		mustHaveValue: true,
		canHaveName: true,
		onTagged(doclet, tag) {
			if (!tag.value.description) {
				return logger.error(`${tag.value.name}缺少目标名称`);
			}
			doclet.kind = 'pmClone';
			doclet.name = tag.value.description;
			setDef(doclet, {
				type: DocKeys.CollectionItem,
				name: tag.value.description,
				source: tag.value.name,
				target: tag.value.description,
				pmData: {
					request: {
						method: 'GET'
					}
				}
			});
		}
	}
};
module.exports = {
	/**
	 * @param {object} options
	 * @returns {{beforeParse(*): void}}
	 */
	install(options) {
		return {
			defineTags(dictionary) {
				Object.keys(tags).forEach((title) => {
					dictionary.defineTag(title, tags[title]);
				});
			}
		};
	}
};
