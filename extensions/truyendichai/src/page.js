load("config.js");
load("utils.js");

function execute(url) {
    return Response.success([normalizeUrl(url)]);
}
