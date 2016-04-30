---
layout: default
title: Blog Archives
---

# {{ page.title }}

{% for post in site.posts %}
<div class="row h4">
  <div class="col-xs-4 col-sm-2 col-md-2">
    <small>{{ post.date | date: "%b %d, %Y" }}</small>
  </div>
  <div class="col-xs-8 col-sm-10 col-md-8">
    <a href="{{ post.url }}">{{ post.title }}</a>
  </div>
</div>
{% endfor %}
