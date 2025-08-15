export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);

    // 1) Endpoint kesehatan
    if (u.pathname === "/ping") {
      return new Response("pong " + new Date().toISOString(), {
        headers: { "content-type": "text/plain" },
      });
    }

    // 2) Ambil FILE_ID dari /v/<FILE_ID> atau ?id=<FILE_ID>
    let fileId = null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "v" && parts[1]) fileId = parts[1];
    if (!fileId) fileId = u.searchParams.get("id");
    if (!fileId) return new Response("Missing id", { status: 400 });
    if (!/^[A-Za-z0-9_-]+$/.test(fileId)) return new Response("Invalid id", { status: 400 });

    // 3) URL Apps Script (pakai env jika tersedia)
    const GAS_BASE =
      (env && env.GAS_BASE) ||
      "https://script.google.com/macros/s/AKfycbz9QhBivSZPJ4MpnRQQ7kKwrJnNjY3E9ZIwG1uKwUEKDCyBt9jQqt0NZDci50BRSQCtkQ/exec"; // ← ganti dgn milik Anda
    const target = `${GAS_BASE}?id=${encodeURIComponent(fileId)}`;

    // 4) Mode debug: tampilkan target saja
    if (u.searchParams.get("debug") === "1") {
      return new Response(`target=${target}`, {
        headers: { "content-type": "text/plain" },
      });
    }

    // 5) Proxy ke GAS
    const upstream = await fetch(target, { headers: { Accept: "text/html" } });

    // Teruskan body + content-type
    const headers = new Headers(upstream.headers);
    if (!headers.get("content-type")) {
      headers.set("content-type", "text/html; charset=utf-8");
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  },
};
