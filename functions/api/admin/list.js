// GET /api/admin/list -> { requests: [...], links: { fileId: url } }   (admin only)
import { json, guard, getRequest, listKeys } from '../../_lib/util.js';

export async function onRequestGet({ request, env }) {
  const denied = await guard(request, env);
  if (denied) return denied;
  if (!env.ARCHIVE) return json({ error: 'unavailable' }, 503);

  const requests = [];
  for (const key of await listKeys(env, 'req:')) {
    const token = key.slice(4);
    const rec = await getRequest(env, token);
    if (rec) requests.push({ token, ...rec });
  }
  requests.sort((a, b) => b.created - a.created);

  const links = {};
  for (const key of await listKeys(env, 'link:')) {
    const url = await env.ARCHIVE.get(key);
    if (url) links[key.slice(5)] = url;
  }
  return json({ requests, links });
}
