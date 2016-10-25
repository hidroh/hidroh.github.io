---
layout: default
title: Conferences
description: Collection of useful conference talks
talks:
  -
    title: "Exploring Java's Hidden Costs"
    conference: 360AnDev 2016
    author: Jake Wharton
    url: "https://realm.io/news/360andev-jake-wharton-java-hidden-costs-android/"
    tags: [java, dex, hashmap, nested-class]
  -
    title: "Sharper Better Faster Dagger"
    conference: DroidCon SF 2016
    author: John Rodriguez
    youtube: 7mVRZqsozPw
    speakerdeck: ca59957899cf4aae815754096b10cbeb
    tags: [dagger, dependency-injection, droidcon, square]
    also:
      -
        title: "DIY: Build Your Own Dependency Injection Library"
        url: "https://realm.io/news/android-pierre-yves-ricau-build-own-dependency-injection/"
  -
    title: "Common RxJava Mistakes"
    conference: DroidCon SF 2016
    author: Dan Lew
    youtube: QdmkXL7XikQ
    speakerdeck: cbc65b08bc5a47b68bdbbfea485c1395
    tags: [rxjava, droidcon]
  -
    title: "Mastering CoordinatorLayout Behaviors"
    conference: DroidCon SF 2016
    author: Dave Smith
    youtube: 22tSgne3ffw
    speakerdeck: 5b318822f03d4c689ea6aa790c26e69e
    github: devunwired/coordinated-effort
    tags: [coordinator-layout, ui, nested-scrolling, droidcon]
  -
    title: "Advanced techniques for concurrency & memory management"
    conference: DroidCon SF 2016
    author: Nabil Hachicha
    youtube: dmABlLsF76s
    speakerdeck: 9a874b04542e4223af5370fdd917eda0
    tags: [memory, threading, gc, droidcon]
  -
    title: "How the Main Thread works"
    conference: Droidcon NYC 2015
    author: Michael Bailey
    youtube: aFGbv9Ih9qQ
    tags: [thread, looper, handler, droidcon]
---
<style>
  .speakerdeck-iframe { width: 560px; height: 315px; }
</style>

<h1>{{ page.title }}<br/><small>{{ page.description }}</small></h1>

{% for post in page.talks %}
<h4>
  {% if post.url %}
  <a href="{{ post.url }}">{{ post.title }}</a>
  {% else %}
  <a href="#{{ forloop.index0 }}" data-toggle="collapse">{{ post.title }}</a>
  {% endif %}
  <small>
  <i class="fa fa-calendar"></i> {{ post.conference }}
  -
  <i class="fa fa-user"></i> {{ post.author }}
  </small>
</h4>

<div class="small">
<i class="fa fa-tags"></i> 
{% for tag in post.tags %}{% if forloop.index0 > 0 %}, {% endif %}{{ tag }}{% endfor %}
{% if post.github %}
-
<i class="fa fa-github"></i> <a href="///github.com/{{ post.github }}">Github</a>
{% endif %}
</div>

{% unless post.url %}
<div class="collapse" id="{{ forloop.index0 }}">
  <div class="container">
    <div class="row">
      <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/{{ post.youtube }}" frameborder="0" allowfullscreen></iframe>
    </div>
    <div class="row">
      <iframe width="560" height="380" allowfullscreen="true" allowtransparency="true" frameborder="0" mozallowfullscreen="true" src="//speakerdeck.com/player/{{ post.speakerdeck }}" style="border:0; padding:0; margin:0; background:transparent;" webkitallowfullscreen="true"></iframe>
    </div>
  </div>
</div>
{% endunless %}

{% if post.also %}
<h4>
  <small>
    See also:
    {% for also in post.also %}
    {% if forloop.index0 > 0 %}, {% endif %}<a href="{{ also.url }}">{{ also.title }}</a>
    {% endfor %}
  </small>
</h4>
{% endif %}

<div class="clearfix divider"></div>

{% endfor %}
