### API克隆

```
/**
 * 添加Api
 * @pmDefine item - cloneApi
 * @property description - description
 * @pmUrl {{host}}/p/a/t/h
 * @pmMethod POST
 * @pmHeaders
 *     content-type: application/json
 * @pmBody raw|application/json
 *    {
		 "username": {{username}}
	  }
 * @pmPreRequest
 *    const lodash = require('lodash');
 *    pm.environment.set('username', 'username');
 *    pm.environment.set('host', 'http://www.baidu.com');
 * @pmBefore apiNameBefore
 * @pmItemOf collectionName
 */

/**
 * targetApi
 * @pmClone cloneApi targetApi
 * @property description - description
 * @pmBody {application/json} raw
 *    {
 *        "username": {{username}}
 *    }
 * @pmPreRequest
 *    pm.environment.set('username', 'username');
 */
```
