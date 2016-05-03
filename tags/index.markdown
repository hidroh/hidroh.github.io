---
layout: default
title: Tag Cloud
---
# {{ page.title }}

<div>
{% assign tags = site.tags | sort %}
{% for tag in tags %}
  {% if tag[1].size >= 10 %}
    {% assign size = 'btn-lg btn-xl' %}
    {% assign type = 'btn-primary' %}
  {% elsif tag[1].size >= 5 %}
    {% assign size = 'btn-lg' %}
    {% assign type = 'btn-primary' %}
  {% elsif tag[1].size == 1 %}
    {% assign size = '' %}
    {% assign type = 'btn-info' %}
  {% else %}
    {% assign size = '' %}
    {% assign type = 'btn-primary' %}
  {% endif %}
<a class="btn {{ type }} {{ size }}" style="margin-bottom:12px;" href="/tags/{{ tag[0] }}">{{ tag[0] }}</a>&nbsp;
{% endfor %}
</div>