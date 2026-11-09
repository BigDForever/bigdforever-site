// GET /thumb?u=<clip link>  ->  302 to a preview picture for that clip.
// Used by the home page and the Clip Vault so every brag card has a picture.
// YouTube: i.ytimg.com. Medal / Twitch clips / Streamable: the page's og:image.
// Anything else, or if lookup fails: the site's share picture.
const FALLBACK = "/assets/art/share.jpg";
const OG_HOSTS = ["medal.tv", "clips.twitch.tv", "www.twitch.tv", "twitch.tv", "m.twitch.tv", "streamable.com", "outplayed.tv"];

function ytId(u) {
  const m = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export async function onRequestGet({ request }) {
  const reqUrl = new URL(request.url);
  const raw = reqUrl.searchParams.get("u") || "";
  const go = (to, ttl) => new Response(null, { status: 302, headers: {
    Location: to.startsWith("/") ? new URL(to, reqUrl.origin).href : to,
    "Cache-Control": `public, max-age=${ttl}`,
  } });

  let target;
  try { target = new URL(raw); } catch { return go(FALLBACK, 3600); }
  if (!/^https?:$/.test(target.protocol)) return go(FALLBACK, 3600);

  const yt = ytId(target.href);
  if (yt) return go(`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`, 86400 * 7);

  if (!OG_HOSTS.includes(target.hostname)) return go(FALLBACK, 3600);

  const cache = caches.default;
  const key = new Request(reqUrl.origin + "/thumb?u=" + encodeURIComponent(target.href));
  const hit = await cache.match(key);
  if (hit) return hit;

  let img = null;
  try {
    const r = await fetch(target.href, { headers: { "User-Agent": "Mozilla/5.0 (compatible; BigDForeverPreview/1.0; +https://bigdforever.com)", "Accept": "text/html" }, redirect: "follow" });
    if (r.ok) {
      const html = (await r.text()).slice(0, 300000);
      const m = html.match(/<meta[^>]+property=["']og:image(?::url)?["'][^>]*content=["']([^"']+)["']/i)
             || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image(?::url)?["']/i);
      if (m) img = m[1].replace(/&amp;/g, "&");
    }
  } catch { /* fall through */ }

  const res = img ? go(img, 86400) : go(FALLBACK, 1800);
  if (img) await cache.put(key, res.clone());
  return res;
}
