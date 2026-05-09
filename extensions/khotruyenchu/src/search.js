load('config.js');
load('utils.js');

function execute(key, page) {
    if (!page) page = '1';

    let perPage = 6;
    let apiUrl = BASE_URL + "/wp-json/wp/v2/search"
        + "?ct_live_search=true"
        + "&type=post"
        + "&subtype%5B%5D=post"
        + "&subtype%5B%5D=page"
        + "&per_page=" + perPage
        + "&page=" + encodeURIComponent(page)
        + "&search=" + encodeURIComponent(key);

    let response = fetch(apiUrl);
    if (response.ok) {
        let json = response.json();
        let data = [];
        let seen = {};

        for (let i = 0; i < json.length; i++) {
            let item = json[i];
            let link = item && item.url ? (item.url + "") : "";
            if (!link || seen[link]) continue;
            seen[link] = true;

            let cover = "";
            if (item && item.ct_featured_media) {
                cover = item.ct_featured_media.source_url || "";
                let sizes = item.ct_featured_media.media_details && item.ct_featured_media.media_details.sizes;
                if (!cover && sizes) {
                    cover = (sizes.medium && sizes.medium.source_url)
                        || (sizes.thumbnail && sizes.thumbnail.source_url)
                        || (sizes.full && sizes.full.source_url)
                        || "";
                }
            }

            let name = item && item.title ? (item.title + "") : "";
            name = name.replace(/^#\s*/, "").trim();

            data.push({
                name: name,
                link: link,
                cover: cover,
                description: "",
                host: BASE_URL
            });
        }

        let next = data.length >= perPage ? String(parseInt(page, 10) + 1) : "";
        return Response.success(data, next);
    }

    // Fallback to old HTML search when JSON endpoint fails.
    return fallbackHtmlSearch(key);
}

function fallbackHtmlSearch(key) {
    let response = fetch(BASE_URL + "/", {
        method: "GET",
        queries: {
            s: key
        }
    });

    if (!response.ok) return null;

    let doc = response.html();
    let entryTitle = doc.select("h1, .entry-title").first();
    let entryContent = doc.select(".entry-content").first();
    if (entryTitle && entryContent) {
        let name = entryTitle.text().replace("Bá»™ truyá»‡n", "").trim();
        let link = response.url;
        let coverEl = doc.select(".truyen-cover img, .hs-thumb img").first();
        let cover = coverEl ? (coverEl.attr("data-src") || coverEl.attr("src")) : "";
        return Response.success([{
            name: name,
            link: link,
            cover: cover,
            host: BASE_URL
        }]);
    }

    return Response.success(parseNovelList(doc));
}
