// var get = Em.get,

export function customappBadgeHTML(customapp, opts) {
    opts = opts || {};
    if (!customapp)
        return "";

    const desc = customapp.text;

    const logoi = '../images/brands/' + customapp.text.replace('.', '').toLowerCase() + '.png';

    var description = desc,
        logo = ' src="' + logoi + '"',
        tagName = 'img',
        html = "";

    var classNames = "badge-category clear-badge";

    var textColor = "#0000FF";

    html += "<span" + ' style="color: ' + textColor + ';" ' + 'data-drop-close="true" class="' + classNames + '"' + (description
        ? 'title="' + Nilavu.Utilities.escapeExpression(description) + '" '
        : '') + ">";

    html += "</span>";

    return "<" + tagName + logo + ">" + html + "</" + tagName + ">";
}
