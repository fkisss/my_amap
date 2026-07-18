// 高德 JS API 2.0 安全密钥代理 (Cloudflare Pages Function)
// 前端 window._AMapSecurityConfig.serviceHost = 'https://my-amap.pages.dev/_AMapService'
// 真实 securityJsCode 只存于 KV(amap_scode)，由本函数转发请求时附加 jscode，前端不再明文暴露密钥。
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 去掉 /_AMapService 前缀，得到高德侧路径（如 v3/place/text）
  const path = url.pathname.replace(/^\/_AMapService\/?/, '');

  const scode = await env.FAVS_KV.get('amap_scode');
  if (!scode) {
    return new Response('Missing amap_scode in KV', { status: 500 });
  }

  // 选择上游：地图样式 / 海外地图 / 默认 Web 服务(restapi)
  let upstreamBase;
  if (path.startsWith('v4/map/styles')) upstreamBase = 'https://webapi.amap.com';
  else if (path.startsWith('v3/vectormap')) upstreamBase = 'https://fmap01.amap.com';
  else upstreamBase = 'https://restapi.amap.com';

  const qs = url.search ? url.search + '&' : '?';
  const target = upstreamBase + '/' + path + qs + 'jscode=' + encodeURIComponent(scode);

  // 转发：保留原始方法与查询，剥离 host/content-length，附上 body
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  const init = { method: request.method, headers, redirect: 'follow' };
  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.text();
  }

  try {
    const resp = await fetch(target, init);
    const out = new Headers(resp.headers);
    out.set('Access-Control-Allow-Origin', '*');
    return new Response(resp.body, { status: resp.status, headers: out });
  } catch (e) {
    return new Response('Proxy error: ' + e.message, { status: 502 });
  }
}
