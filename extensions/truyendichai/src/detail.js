load("config.js");
load("utils.js");

function execute(url) {
    url = normalizeUrl(url);
    var doc = fetchDoc(url);
    if (!doc) return Response.error("Cannot load detail");

    var html = doc.html();
    var nameEl = doc.select("h1").first();
    var name = nameEl ? cleanText(nameEl.text()) : firstMatch(html, /"title"\s*:\s*"([^"]+)"/);
    var cover = imageFromElement(doc.select("img[src*='anh-bia'], img[src*='_next/image']").first());
    if (!cover) cover = normalizeImage(firstMatch(html, /"image_url"\s*:\s*"([^"]+)"/));

    var author = firstMatch(html, /"author"\s*:\s*"([^"]*)"/);
    var status = firstMatch(html, /"status"\s*:\s*"([^"]*)"/);
    var ongoing = status !== "completed";

    var description = "";
    var sections = doc.select("section");
    for (var i = 0; i < sections.size(); i++) {
        var section = sections.get(i);
        if (section.text().indexOf("Giới thiệu truyện") >= 0) {
            var clone = section.clone();
            clone.select("h2, button").remove();
            description = clone.html();
            break;
        }
    }
    if (!description) {
        description = firstMatch(html, /"description"\s*:\s*"([^"]*)"/)
            .replace(/\\n/g, "<br>");
    }

    var genres = [];
    var seen = {};
    var links = doc.select("a[href*='/the-loai/']");
    for (var j = 0; j < links.size(); j++) {
        var el = links.get(j);
        var title = cleanText(el.text());
        var href = normalizeUrl(el.attr("href"));
        if (!title || seen[href]) continue;
        seen[href] = true;
        genres.push({ title: title, input: href, script: "gen.js" });
    }

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: description,
        ongoing: ongoing,
        genres: genres
    });
}
