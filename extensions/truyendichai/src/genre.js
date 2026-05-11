load("config.js");
load("utils.js");

function execute() {
    var doc = fetchDoc(BASE_URL);
    if (!doc) return Response.error("Cannot load genres");

    var genres = [];
    var seen = {};
    var links = doc.select("a[href*='/the-loai/']");
    for (var i = 0; i < links.size(); i++) {
        var el = links.get(i);
        var title = cleanText(el.text());
        var href = normalizeUrl(el.attr("href"));
        if (!title || seen[href]) continue;
        seen[href] = true;
        genres.push({ title: title, input: href, script: "gen.js" });
    }
    return Response.success(genres);
}
