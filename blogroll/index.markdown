---
layout: default
title: Blogroll
description: My blog and web bookmarks
blogroll:
  -
    title: "Developing for Android"
    url: https://medium.com/google-developers/developing-for-android-introduction-5345b451567c
    host: medium.com
  -
    title: "Support Libraries v22.1.0"
    url: https://chris.banes.me/2015/04/22/support-libraries-v22-1-0/
    host: chris.banes.me
  -
    title: "Android Performance Patterns"
    url: https://www.youtube.com/playlist?list=PLWz5rJ2EKKc9CBxr3BVjPTPoDPLdPIFCE
    host: youtube.com
  -
    title: "Udacity - Android Performance"
    url: https://www.udacity.com/course/ud825
    host: udacity.com
  -
    title: "Understand Android Activity's launchMode"
    url: http://inthecheesefactory.com/blog/understand-android-activity-launchmode/en
    host: inthecheesefactory.com
  -
    title: "The Terrible Technical Interview"
    url: http://techcrunch.com/2015/03/21/the-terrible-technical-interview/
    host: techcrunch.com
  -
    title: "Dependency Injection with Dagger 2 (Devoxx 2014)"
    url: https://speakerdeck.com/jakewharton/dependency-injection-with-dagger-2-devoxx-2014
    host: speakerdeck.com
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
  -
    title: "Java theory and practice: Managing volatility"
    url: http://www.ibm.com/developerworks/library/j-jtp06197/
    host: ibm.com
  -
    title: "Understanding Weak References"
    url: https://weblogs.java.net/blog/2006/05/04/understanding-weak-references
    host: weblogs.java.net
---

<h1>{{ page.title }}<br/><small>{{ page.description }}</small></h1>

{% for post in page.blogroll %}
<h4>
  <a href="{{ post.url }}" target="_blank">{{ post.title }}</a>
  <small>{{ post.host }}</small>
</h4>
{% endfor %}
