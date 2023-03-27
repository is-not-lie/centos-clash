import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaBody from 'koa-body';
import { request, ProxyAgent } from 'undici';
import { config } from 'dotenv';

config();

const app = new Koa();
const router = new KoaRouter();
const SERVER_PORT = process.env.PORT || 8888;
const PROXY_PORT = process.env.PROXY_PORT || 7890;
const METHODS = ['GET', 'POST', 'DELETE', 'PUT'];

app.use(koaBody());

interface Params extends Record<string, any> {
  url: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  data?: Record<string, any>;
  headers?: Record<string, any>;
}
const checkParams = (params: Params) => {
  const { url, method } = params || {};
  if (!url) return { success: false, message: '代理的目标地址不能为空!' };
  if (!METHODS.includes(method))
    return {
      success: false,
      message: `请求方式必须为 ${METHODS.join('、')} 中的一种`,
    };
  return params;
};

router.post('/api/clash/proxy', async (ctx, next) => {
  const params = checkParams(ctx.request.body);

  if (params.success === false) {
    ctx.body = {
      code: 0,
      data: params.message,
    };
    return next();
  }

  const { url, method, data, headers } = params as Params;

  try {
    const { statusCode, body } = await request(url, {
      method,
      ...(data &&
        (['POST', 'PUT'].includes(method)
          ? {
              body: JSON.stringify(data),
            }
          : { query: data })),
      headers,
      dispatcher: new ProxyAgent(`http://127.0.0.1:${PROXY_PORT}`),
    });

    if (statusCode === 200) {
      ctx.body = {
        code: 200,
        data: await body.json(),
      };
      return next();
    }

    throw new Error(`code: ${statusCode}`);
  } catch (error) {
    console.log(`🙅 ~~~ 接口 ${url} 请求异常, 错误信息: ${error}`);
    ctx.body = {
      code: 0,
      data: null,
    };
    next();
  }
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(SERVER_PORT, () => {
  console.log(`🚀 ~~~ server running in ${SERVER_PORT} ~~~ 🚀`);
});
