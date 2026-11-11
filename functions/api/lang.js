// GET /api/lang -> { lang: 'zh' | 'en' }
// Default language by the visitor's country (Cloudflare provides it). The country itself is
// never returned or stored; only the resulting language.
import { json, pickLang } from '../_lib/util.js';

export async function onRequestGet({ request }) {
  const country = (request.cf && request.cf.country) || request.headers.get('CF-IPCountry') || '';
  return json({ lang: pickLang(country) });
}
