load("config.js");
load("utils.js");

function execute(url) {
    url = normalizeUrl(url);
    var doc = fetchDoc(url);
    if (!doc) return Response.error("Cannot load toc");

    var html = doc.html();
    var slug = detailSlugFromUrl(url);
    var prefix = url.indexOf("/doc-truyen/cv/") >= 0 ? "/doc-truyen/cv/" : "/doc-truyen/";
    var latest = parseIntSafe(firstMatch(html, /"latest_chapter_number"\s*:\s*(\d+)/));

    var titleByNumber = {};
    var links = doc.select("a[href*='/chuong-']");
    for (var i = 0; i < links.size(); i++) {
        var el = links.get(i);
        var href = (el.attr("href") || "") + "";
        if (href.indexOf("/" + slug + "/chuong-") < 0) continue;
        var number = parseIntSafe(firstMatch(href, /\/chuong-(\d+)/));
        var title = cleanText(el.text());
        if (number > 0 && title) {
            titleByNumber[number] = title;
            if (number > latest) latest = number;
        }
    }

    if (latest <= 0) latest = links.size();

    var chapters = [];
    for (var n = 1; n <= latest; n++) {
        chapters.push({
            name: titleByNumber[n] || ("Chương " + n),
            url: BASE_URL + prefix + slug + "/chuong-" + n,
            host: BASE_URL
        });
    }

    return Response.success(chapters);
}
