function normalizeUrl(url) {
    url = (url || "") + "";
    if (url.indexOf("//") === 0) return "https:" + url;
    if (url.indexOf("/") === 0) return BASE_URL + url;
    if (url.indexOf("http") !== 0) return BASE_URL + "/" + url;
    return url.replace(/^https?:\/\/(?:www\.)?truyendich\.ai/i, BASE_URL);
}

function cleanText(text) {
    return ((text || "") + "").replace(/\s+/g, " ").trim();
}

function htmlDecode(text) {
    return ((text || "") + "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function normalizeImage(src) {
    src = htmlDecode((src || "") + "");
    if (!src) return "";

    var match = /[?&]url=([^&]+)/.exec(src);
    if (match && match[1]) {
        try {
            src = decodeURIComponent(match[1]);
        } catch (e) {
            src = match[1];
        }
    }

    return normalizeUrl(src);
}

function imageFromElement(el) {
    if (!el) return "";
    return normalizeImage(el.attr("data-src") || el.attr("data-lazy-src") || el.attr("src") || "");
}

function firstMatch(text, pattern) {
    var match = pattern.exec(text || "");
    return match && match[1] ? htmlDecode(match[1]) : "";
}

function parseIntSafe(value) {
    value = ((value || "") + "").replace(/[^\d]/g, "");
    if (!value) return 0;
    return parseInt(value, 10);
}

function fetchDoc(url) {
    var response = fetch(normalizeUrl(url), { headers: BASE_HEADERS });
    if (!response.ok) return null;
    return response.html();
}

function parseNovelList(doc) {
    var data = [];
    var seen = {};
    var links = doc.select("a[href*='/doc-truyen/']");

    for (var i = 0; i < links.size(); i++) {
        var item = links.get(i);
        var href = (item.attr("href") || "") + "";
        if (!href || href.indexOf("/chuong-") >= 0) continue;

        var h3 = item.select("h3").first();
        if (!h3) continue;

        var link = normalizeUrl(href).split("?")[0].split("#")[0];
        if (seen[link]) continue;
        seen[link] = true;

        var name = cleanText(h3.text());
        var cover = imageFromElement(item.select("img").first());
        if (!cover) {
            for (var c = 0; c < links.size(); c++) {
                var coverLink = links.get(c);
                if (((coverLink.attr("href") || "") + "") !== href) continue;
                cover = imageFromElement(coverLink.select("img").first());
                if (cover) break;
            }
        }
        var text = cleanText(item.text());
        var description = "";
        var chapterMatch = /(\d[\d,.]*)\s*chương/i.exec(text);
        if (chapterMatch && chapterMatch[1]) {
            description = "Số chương: " + chapterMatch[1];
        }

        if (name && link) {
            data.push({
                name: name,
                link: link,
                cover: cover,
                description: description,
                host: BASE_URL
            });
        }
    }

    return data;
}

function nextPageFromHtml(html, page, itemCount) {
    var total = parseIntSafe(firstMatch(html, /"total"\s*:\s*(\d+)/));
    var pageSize = parseIntSafe(firstMatch(html, /"pageSize"\s*:\s*(\d+)/));
    if (total > 0 && pageSize > 0 && page * pageSize < total) {
        return (page + 1) + "";
    }
    if (itemCount >= 24) return (page + 1) + "";
    return "";
}

function stripEditionPrefix(url) {
    return normalizeUrl(url).replace("/doc-truyen/cv/", "/doc-truyen/");
}

function detailSlugFromUrl(url) {
    var clean = stripEditionPrefix(url).split("?")[0].split("#")[0];
    clean = clean.replace(/\/+$/, "");
    var parts = clean.split("/");
    return parts[parts.length - 1];
}
