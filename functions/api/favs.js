// Cloudflare Pages Function: /api/favs
// 收藏点/标注 云端存储接口
//   GET    /api/favs         公开读取全部收藏点(JSON 数组)
//   PUT    /api/favs         写入全部收藏点(整体覆盖)，需在请求头带 X-Edit-Token，且与环境变量 EDIT_TOKEN 匹配
//   OPTIONS                  CORS 预检
//
// 依赖(需在 Cloudflare 控制台配置)：
//   - KV 命名空间绑定：变量名 FAVS_KV
//   - 环境变量：EDIT_TOKEN = 你自定义的编辑口令(字符串)
//
// 数据以键名 "favs" 存储在 KV 中，值为收藏点 JSON 数组字符串。

const KV_KEY = 'favs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Edit-Token',
  'Access-Control-Max-Age': '86400',
};

function json(body, status = 200, extraHeaders = {}) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// CORS 预检
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// 读取：公开
export async function onRequestGet({ env }) {
  if (!env.FAVS_KV) {
    return json({ error: 'KV 未绑定，请在 Cloudflare 控制台为 Pages 项目绑定名为 FAVS_KV 的 KV 命名空间' }, 500);
  }
  const data = await env.FAVS_KV.get(KV_KEY);
  // 未初始化时返回空数组，前端会用 fav.json 作为种子
  return json(data && data.trim() ? data : '[]');
}

// 写入：需口令
export async function onRequestPut({ request, env }) {
  if (!env.FAVS_KV) {
    return json({ error: 'KV 未绑定 (FAVS_KV)' }, 500);
  }
  if (!env.EDIT_TOKEN) {
    return json({ error: '服务端未设置 EDIT_TOKEN 环境变量，无法写入' }, 500);
  }

  const token = request.headers.get('X-Edit-Token') || '';
  if (token !== env.EDIT_TOKEN) {
    return json({ error: '编辑口令错误或缺失' }, 401);
  }

  let body;
  try {
    body = await request.text();
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed)) throw new Error('not-array');
    // 简单体量保护：最多 5000 条，单次不超过约 4MB(KV 单值上限约 25MB，这里保守限制)
    if (parsed.length > 5000) {
      return json({ error: '收藏点数量超过上限(5000)' }, 400);
    }
  } catch (e) {
    return json({ error: '请求体不是合法的 JSON 数组' }, 400);
  }

  await env.FAVS_KV.put(KV_KEY, body);
  return json({ ok: true, count: JSON.parse(body).length });
}
