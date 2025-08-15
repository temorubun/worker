export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Terima pola: /v/<FILE_ID> atau ?id=<FILE_ID>
    let fileId = null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "v" && parts[1]) fileId = parts[1];
    if (!fileId) fileId = url.searchParams.get("id");

    if (!fileId) return new Response("Missing id", { status: 400 });
    if (!/^[A-Za-z0-9_-]+$/.test(fileId)) return new Response("Invalid id", { status: 400 });

    const GAS_BASE = "https://script.google.com/macros/s/AKfycbz9QhBivSZPJ4MpnRQQ7kKwrJnNjY3E9ZIwG1uKwUEKDCyBt9jQqt0NZDci50BRSQCtkQ/exec"; // ← ganti dengan /exec Anda
    const target = `${GAS_BASE}?id=${encodeURIComponent(fileId)}`;

    const upstream = await fetch(target, { headers: { Accept: "text/html" } });
    const headers = new Headers(upstream.headers);
    if (!headers.get("content-type")) headers.set("content-type", "text/html; charset=utf-8");

    return new Response(upstream.body, { status: upstream.status, headers });
  },
};
