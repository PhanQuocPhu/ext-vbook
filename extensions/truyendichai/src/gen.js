load("config.js");
load("utils.js");

function execute(url, page) {
    page = page || "1";
    var pageNumber = parseInt(page, 10);
    if (!pageNumber || pageNumber < 1) pageNumber = 1;

    var fetchUrl = normalizeUrl(url);
    if (pageNumber > 1) {
        fetchUrl += (fetchUrl.indexOf("?") >= 0 ? "&" : "?") + "page=" + pageNumber;
    }

    var response = fetch(fetchUrl, { headers: BASE_HEADERS });
    if (!response.ok) return Response.error("Cannot load: " + response.status);

    var doc = response.html();
    var data = parseNovelList(doc);
    var next = nextPageFromHtml(doc.html(), pageNumber, data.length);
    return Response.success(data, next);
}
