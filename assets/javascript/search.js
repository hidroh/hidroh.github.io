// Extract the param value from the URL.
function paramValue(query_param) {
  var results = new RegExp('[\\?&]' + query_param + '=([^&#]*)').exec(window.location.href);
  return results ? results[1] : "";
}
function appendTitle(text) {
  $('h1#title:first-child').append(text);
}
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function dateString(date) {
  return MONTHS[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}
function supportHistory() {
  try {
    return 'history' in window && window['history'] !== null;
  } catch (e) {
    return false;
  }
}
function format(el, data) {
  if (supportHistory()) {
    history.replaceState(data, "", window.location.href);
  }
  if (data.length === 0) {
    $("#placeholder").text("No posts found.");
    return;
  }
  $("#placeholder").remove();
  appendTitle(" (" + data.length + ")");
  $.each(data, function(key, val) {
    relativeLink = val.link.replace(/^(?:\/\/|[^\/]+)*\//, "/");
    article = $("<article>").append(val.summary);
    article.find("p:has(a#more)").nextAll().remove();
    el.append($("<h3>")
        .append($("<small>")
          .append($("<i>").attr("class", "fa fa-calendar"))
          .append("&nbsp;&nbsp;" + dateString(new Date(val.published_on)))
        )
      )
      .append($("<h2>").append($("<a>").attr("href", relativeLink).text(val.title)))
      .append(article)
      .append($("<a>")
        .attr("href", relativeLink + "#more")
        .attr("class", "btn btn-default btn-lg")
        .html("Read on&nbsp;&nbsp;<i class=\"fa fa-long-arrow-right\"></i>"));
    if (key != data.length - 1) {
      el.append($("<div>").attr("class", "clearfix divider"));
    }
  });
}
