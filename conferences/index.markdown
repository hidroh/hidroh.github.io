---
layout: default
title: Conferences
description: Collection of useful conference talks
talks:
  -
    title: "Sharper Better Faster Dagger - DroidCon SF 2016"
    author: John Rodriguez
    youtube: 7mVRZqsozPw
    speakerdeck: ca59957899cf4aae815754096b10cbeb
    tags: [dagger, dependency-injection, droidcon, square]
  -
    title: "Common RxJava Mistakes - DroidCon SF 2016"
    author: Dan Lew
    youtube: QdmkXL7XikQ
    speakerdeck: cbc65b08bc5a47b68bdbbfea485c1395
    tags: [rxjava, droidcon]
---
<style>
  .speakerdeck-iframe { width: 560px; height: 315px; }
</style>

<h1>{{ page.title }}<br/><small>{{ page.description }}</small></h1>

{% for post in page.talks %}
<h4>
  <a href="#{{ forloop.index0 }}" data-toggle="collapse">{{ post.title }}</a>
</h4>

<div class="small">
<i class="fa fa-user"></i> {{ post.author }}
-
<i class="fa fa-tags"></i> 
{% for tag in post.tags %}{% if forloop.index0 > 0 %}, {% endif %}{{ tag }}{% endfor %}
</div>

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

{% endfor %}
