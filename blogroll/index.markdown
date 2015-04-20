---
layout: default
title: Blogroll
blogroll:
  -
    title: "Understand Android Activity's launchMode"
    url: http://inthecheesefactory.com/blog/understand-android-activity-launchmode/en
    host: inthecheesefactory.com
  -
    title: "The Terrible Technical Interview"
    url: http://techcrunch.com/2015/03/21/the-terrible-technical-interview/
    host: techcrunch.com
  -
    title: "Fast Rendering News Feed on Android"
    url: https://code.facebook.com/posts/879498888759525/fast-rendering-news-feed-on-android/
    host: code.facebook.com
  -
    title: "Material Design on Android Checklist"
    url: http://android-developers.blogspot.com/2014/10/material-design-on-android-checklist.html
    host: android-developers.blogspot.com
  -
    title: "appcompat v21: material design for pre-Lollipop devices!"
    url: https://chris.banes.me/2014/10/17/appcompat-v21/
    host: chris.banes.me
  -
    title: "Advocating Against Android Fragments"
    url: https://corner.squareup.com/2014/10/advocating-against-android-fragments.html
    host: corner.squareup.com
  -
    title: "The history of Android"
    url: http://arstechnica.com/gadgets/2014/06/building-android-a-40000-word-history-of-googles-mobile-os/
    host: arstechnica.com
  -
    title: "Building Carousel, Part I: How we made our networked mobile app feel fast and local"
    url: https://blogs.dropbox.com/tech/2014/04/building-carousel-part-i-how-we-made-our-networked-mobile-app-feel-fast-and-local/
    host: blogs.dropbox.com
  -
    title: "A journey on the Android Main Thread"
    url: https://corner.squareup.com/2013/10/android-main-thread-1.html
    host: corner.squareup.com
  -
    title: "How to Leak a Context: Handlers & Inner Classes"
    url: http://www.androiddesignpatterns.com/2013/01/inner-class-handler-memory-leak.html
    host: androiddesignpatterns.com
  -
    title: "Android Application Launch (Part 2)"
    url: http://multi-core-dump.blogspot.com/2010/04/android-application-launch-part-2.html
    host: multi-core-dump.blogspot.com
  -
    title: "Android Application Launch"
    url: http://multi-core-dump.blogspot.com/2010/04/android-application-launch.html
    host: multi-core-dump.blogspot.com
---

# {{ page.title }}

{% for post in page.blogroll %}
<h3>
  <a href="{{ post.url }}" target="_blank">{{ post.title }}</a><br />
  <small>{{ post.host }}</small>
</h3>
{% endfor %}
