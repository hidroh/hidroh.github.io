---
layout: post
title:  "Hacking up an ad blocker for Android"
date:   2016-05-19 12:35:34
description: "Simple steps to intercept WebView requests and block unwanted resources"
tags: android webview adblocker
---

<div class="cap"></div>

I was shuffling to catch up with news waiting for Google I/O 2016 to start (which was 1AM my timezone), while an idea just popped up: let's build an ad blocker to browse news in my phone without the unwanted distraction!

Some brainstorming needed here. We're gonna need to prevent `WebView` from loading ads, or unwanted resources, when it tries to load a webpage. A little digging into `WebView` documentation leads us to `WebViewClient`[^1]. We can use `shouldInterceptRequest()` to intercept each request issued by a webpage, check its URL and decide whether we want to load resources from that URL.

Now how do we identify if resources from a URL are potentially ads? Let's check how popular ad blockers like [uBlock Origin] or AdBlock do it: they both have a few black lists of things to filter. [Easylist], EasyPrivacy, etc are some well known ones, but are overkill for our needs: they specify sites with CSS selectors, while we only have a URL to work with here. [pgl.yoyo.org] list[^2] used by uBlock Origin seems to be promising though: it generates all hostnames considered ad servers. Now we only need to match blacklisted hostnames with our URL!

<!--more-->[ ](#){: id="more"}

**TL;DR**

A summary of what we need to do:

- Get the list of ad hostnames from [pgl.yoyo.org]
- Save the list somewhere, load it when application starts
- Use `WebViewClient.shouldInterceptRequest(WebView, String)` to intercept requests
- Check if the request URL belongs to one of the hostnames in the list and override it, returning a dummy resource instead of the actual one, which is supposed to be ads

### Getting list of ad hostnames

[pgl.yoyo.org] site provides a few options to generate the list. Since we only care about hostnames without IP addresses, let's choose `plain non-HTML list -- as a plain list of hostnames (no HTML)` with `no links back to this page` (we should accredit it somewhere else of course).

<a href="/assets/img/pgl.yoyo.org.png"><img src="/assets/img/pgl.yoyo.org.png" class="img-responsive center-block img-thumbnail" /></a>

This will give us a list as follows:

**pgl.yoyo.org.txt**
{% highlight text %}
101com.com
101order.com
123found.com
180hits.de
180searchassistant.com
1x1rank.com
207.net
247media.com
...
{% endhighlight %}

### Load ad hostnames into memory

We can either save this list to a file, include it as an asset, or as a raw resource in our app[^4]. In either case we will have to do I/O operation to read from this file. Let's pick asset.

Loading from file is simple. [Okio] is used below, but it can be replaced by `java.io` APIs. One thing to keep in mind is we should do I/O operation in background thread. A simple `AsyncTask` will do. Here we load directly into a static `Set` variable, which would persist in memory as long as the app process runs, but let's keep it simple here.

**MyApplication.java**
{% highlight java %}
public class MyApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        AdBlocker.init(this);
    }
}
{% endhighlight %}

**AdBlocker.java**
{% highlight java %}
public class AdBlocker {
    private static final String AD_HOSTS_FILE = "pgl.yoyo.org.txt";
    private static final Set<String> AD_HOSTS = new HashSet<>();

    public static void init(Context context) {
        new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {
                try {
                    loadFromAssets(context);
                } catch (IOException e) {
                    // noop
                }
                return null;
            }
        }.execute();
    }

    @WorkerThread
    private static void loadFromAssets(Context context) throws IOException {
        InputStream stream = context.getAssets().open(AD_HOSTS_FILE);
        BufferedSource buffer = Okio.buffer(Okio.source(stream));
        String line;
        while ((line = buffer.readUtf8Line()) != null) {
            AD_HOSTS.add(line);
        }
        buffer.close();
        stream.close();
    }
}
{% endhighlight %}

### Intercept request

Next step is to intercept `WebView`'s requests[^3] to check if they should be overriden. The logic below caches previously checked results from the same session so we don't end up rechecking the same URL.

{% highlight java %}
webView.setWebViewClient(new WebViewClient() {
    private Map<String, Boolean> loadedUrls = new HashMap<>();

    @TargetApi(Build.VERSION_CODES.HONEYCOMB)
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        boolean ad;
        if (!loadedUrls.containsKey(url)) {
            ad = AdBlocker.isAd(url);
            loadedUrls.put(url, ad);
        } else {
            ad = mLoadedUrls.get(url);
        }
        return ad ? AdBlocker.createEmptyResource() :
                super.shouldInterceptRequest(view, url);
    }
});
webView.loadUrl("http://example.com");
{% endhighlight %}

### Match domain and override resource

Last step is to implement `AdBlocker.isAd(url)` and `AdBlocker.createEmptyResource()`. The latter one should be straightforward. The interesting bit now is how to match a full URL with the list of hostnames. 

Let's consider ads from Google Doubleclick network: it has URLs with hosts such as `pubads.g.doubleclick.net`, `adclick.g.doubleclick.net`, `googleads.g.doubleckick.net`. We have one single entry in our list that may match - `doubleclick.net`. Our strategy here would be to extract the host from URL, walk up the sub-domain chain, try to match the whole sub-domain first, then keep stripping off the sub-domain until we exhaust or find a match.

{% highlight text %}
// Checking if pubads.g.doubleclick.net is a match
doubleclick.net != pubads.g.doubleclick.net
doubleclick.net !=        g.doubleclick.net
doubleclick.net ==          doubleclick.net
-> block pubads.g.doubleclick.net
{% endhighlight %}

**AdBlocker.java**
{% highlight java %}
import okhttp3.HttpUrl;

public class AdBlocker {
    private static final Set<String> AD_HOSTS = new HashSet<>();
    ...
    public static boolean isAd(String url) {
        HttpUrl httpUrl = HttpUrl.parse(url);
        return isAdHost(httpUrl != null ? httpUrl.host() : "");
    }
    
    private static boolean isAdHost(String host) {
        if (TextUtils.isEmpty(host)) {
            return false;
        }
        int index = host.indexOf(".");
        return index >= 0 && (AD_HOSTS.contains(host) ||
                index + 1 < host.length() && isAdHost(host.substring(index + 1)));
    }

    @TargetApi(Build.VERSION_CODES.HONEYCOMB)
    public static WebResourceResponse createEmptyResource() {
        return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream("".getBytes()));
    }
}
{% endhighlight %}

That's fun! Add an adress bar, a progress bar, a few standard browser buttons and you now have an ad-free Android web browser, built by yourself! The solution is not as comprehensive as uBlock Origin or AdBlock, but it should remove enough distraction. Check out a demo below:

<div class="container">
    <div class="row">
        <div class="col-xs-10 col-xs-offset-1 col-md-8 col-md-offset-1">
            <iframe width="270" height="480" src="https://www.youtube-nocookie.com/embed/JLXdvEMs5Eo?rel=0" frameborder="0" allowfullscreen></iframe>
            <iframe width="270" height="480" src="https://www.youtube-nocookie.com/embed/2tZJ_NEtOPA?rel=0" frameborder="0" allowfullscreen></iframe>
        </div>
    </div>
</div>

A complete implementation can be found on Materialistic's [Github] repository:

- [`pg.yolo.org.txt`][pg.yolo.org.txt]
- [`AdBlocker.java`][AdBlocker.java]

---
[^1]: `WebViewClient` will be called when things happen that impact the rendering of the content, eg, errors or form submissions. You can also intercept URL loading here (via `shouldOverrideUrlLoading()`). - [developer.android.com](https://developer.android.com/reference/android/webkit/WebView.html)
[^2]: Ad blocking with ad server hostnames and IP addresses - <https://pgl.yoyo.org/as/>
[^3]: `WebViewClient.shouldInterceptRequest()` is only available from API 11, and has been deprecated since API 21. The newer version currently wires up to this one, so implementing one should be sufficient for now.
[^4]: `res/raw/` stores arbitrary files that have resource ID. `assets/` stores file with original file names and file hierarchy, but without resource ID. - [developer.android.com](https://developer.android.com/guide/topics/resources/providing-resources.html)
[uBlock Origin]: https://github.com/gorhill/uBlock
[pgl.yoyo.org]: https://pgl.yoyo.org/as/
[Easylist]: https://easylist.github.io
[Okio]: https://github.com/square/okio
[Github]: https://github.com/hidroh/materialistic
[pg.yolo.org.txt]: https://github.com/hidroh/materialistic/blob/master/app/src/main/assets/pgl.yoyo.org.txt
[AdBlocker.java]: https://github.com/hidroh/materialistic/blob/master/app/src/main/java/io/github/hidroh/materialistic/AdBlocker.java