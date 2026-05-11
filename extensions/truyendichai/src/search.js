load("config.js");
load("utils.js");

function execute(key, page) {
    page = page || "1";
    var pageNumber = parseInt(page, 10);
    if (!pageNumber || pageNumber < 1) pageNumber = 1;

    var url = BASE_URL + "/tim-kiem?q=" + encodeURIComponent(key || "");
    if (pageNumber > 1) url += "&page=" + pageNumber;

    var response = fetch(url, { headers: BASE_HEADERS });
    if (!response.ok) return Response.error("Cannot search: " + response.status);

    var doc = response.html();
    var data = parseNovelList(doc);
    var next = nextPageFromHtml(doc.html(), pageNumber, data.length);
    return Response.success(data, next);
}
