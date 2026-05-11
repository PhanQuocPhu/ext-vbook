load("config.js");
load("utils.js");

function execute(url) {
    var doc = fetchDoc(url);
    if (!doc) return Response.error("Cannot load chapter");

    doc.select("script, style, iframe, ins, nav, header, footer, button").remove();
    doc.select(".ads, .advertisement, [class*='ads'], [id*='ads']").remove();

    var contentEl = doc.select("section[itemProp='text'] #original-content-tab").first();
    if (!contentEl) contentEl = doc.select("section[itemProp='text']").first();
    if (!contentEl) contentEl = doc.select(".prose-novel").first();
    if (!contentEl) return Response.error("No content found");

    var content = (contentEl.html() || "") + "";
    content = content.replace(/&nbsp;/g, " ").trim();
    return Response.success(content);
}
