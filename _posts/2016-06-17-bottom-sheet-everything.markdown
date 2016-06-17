---
layout: post
title:  "Bottom sheet everything"
date:   2016-06-17 02:10:34
description: "Applications of bottom sheet to improve user experience"
tags: android ui bottomsheet preference dialog deeplink
image: /assets/img/bottom-sheet-4.png
---

<div class="cap"></div>

No, sorry that is just a catchy title. We of course should not bottom sheet[^1] everything. But using it in the right context can greatly improve user experience. In this article, I will share my experience applying bottom sheet in my Android application, [Materialistic]:

* to deep link to a screen within the application
* to display a richer, more visual options menu

<!--more-->[ ](#){: id="more"}

A little context here: bottom sheet is a material design component that has been officially included in Google design guidelines since August 2015, and introduced in Support Library 6 months later[^2], as part of design support library 23.2. What we get out of the box are:

* `BottomSheetBehavior`: behavior for a child view of `CoordinatorLayout`, which allows gestures to peek, swipe and dismiss bottom sheet
* `BottomSheetDialog`: a dialog with bottom sheet behavior
* `BottomSheetDialogFragment`: a very thin extension of `DialogFragment`, creating a `BottomSheetDialog` instead of a standard `Dialog`

All we need to do to get these goodies is to declare the following dependency:

**app/build.gradle**
{% highlight groovy %}
dependencies {
  compile "com.android.support:design:<latest-version>"
}
{% endhighlight %}

Now let's do something fun wih it.

### Deep linking with bottom sheet Activity

Deep linking has been one of the signature of the Android platform. It allows applications to declare intention to handle certain links from outside[^3], providing a more seamless navigating experience for users. An example is when users search for something, choose a search result, and read the result content in the application of their choice.

Traditionally, deep linking leads users to a full screen page within an application, taking them away from the current context, before returning to it upon back navigation. This is totally fine for most scenarios, but it doesn't mean that we can't fine tune this behavior. What if I am searching for something, peek at one result, not interested, carry on and peek at the next one, which I decide to open in full screen. Did you get the keyword? *Peek*. That calls for bottom sheet!

We need an `Activity` to listen to and filter Intents here[^4]. Creating and showing a `BottomSheetDialogFragment` when this `Activity` is created should be sufficient. But if you are one of those people who 'nay' or 'mmmmmm' when being asked about `Fragment`[^5], or if we already have an `Activity`, then we would want to make a 'bottom sheet `Activity`' here. Well, the truth is it's super easy to make one!

TL;DR, what we need:

* A translucent theme `Activity`[^6], since we don't want it to block the whole current screen
* A `CoordinatorLayout` which serves as the `Activity`'s content view
* A child `View`/`ViewGroup` that has `BottomSheetBehavior`, which hosts the actual content of the `Activity`

I would recommend setting `backgroundDimEnabled` in `Activity`'s theme, which dims the window behind the `Activity`, like when a `Dialog` is shown. Even though our `Activity` only peeks at the bottom, it still essentially occupies the whole screen. We wouldn't want to leave the impression that users can interact with the `Activity` behind, so let's dim it.

**values/styles.xml**
{% highlight xml %}
<style name="AppTheme.Translucent" parent="Theme.AppCompat.NoActionBar">
    <item name="android:windowIsTranslucent">true</item>
    <item name="android:windowBackground">@android:color/transparent</item>
    <item name="android:backgroundDimEnabled">true</item>
</style>
{% endhighlight %}

**AndroidManifest.xml**
{% highlight xml %}
<activity
    android:name=".UserActivity"
    android:theme="@style/AppTheme.Translucent">
    <intent-filter android:label="@string/filter_title_item" >
        <action android:name="android.intent.action.VIEW" />

        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />

        <data
            android:host="news.ycombinator.com"
            android:pathPrefix="/user"
            android:scheme="https" />
    </intent-filter>
</activity>
{% endhighlight %}

**layout/activity_user.xml**
{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<android.support.design.widget.CoordinatorLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <FrameLayout
        android:id="@+id/bottom_sheet"
        app:layout_behavior="android.support.design.widget.BottomSheetBehavior"
        app:behavior_peekHeight="128dp"
        app:behavior_hideable="true"
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <!-- orignal content view goes here -->

    </FrameLayout>

</android.support.design.widget.CoordinatorLayout>
{% endhighlight %}

**UserActivity.java**
{% highlight java %}
public class UserActivity extends AppCompatActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // handle intent here
    setContentView(R.layout.activity_user);
  }
}
{% endhighlight %}

So far so good, we now have a bottom sheet `Activity` that peeks when deep linking to:

<a href="/assets/img/bottom-sheet-1.png"><img src="/assets/img/bottom-sheet-1.png" class="img-responsive center-block img-thumbnail" width="270" height="480" /></a>
<figcaption>Bottom sheet Activity!</figcaption>

But we quickly realize that tapping outside or swipe down peek view does not dismiss it. We need logic to handle this, by declaring a dummy view to handle touching outside and listening to `BottomSheetBehavior.BottomSheetCallback` events (I'm using Java 8 lambda syntax here):

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<android.support.design.widget.CoordinatorLayout...>

    <View
        android:id="@+id/touch_outside"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

    <FrameLayout
        android:id="@+id/bottom_sheet"
        app:layout_behavior="android.support.design.widget.BottomSheetBehavior".../>

</android.support.design.widget.CoordinatorLayout>
{% endhighlight %}

{% highlight java %}
public class UserActivity extends AppCompatActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    ...
    findViewById(R.id.touch_outside).setOnClickListener(v -> finish());
    BottomSheetBehavior.from(findViewById(R.id.bottom_sheet))
      .setBottomSheetCallback(new BottomSheetBehavior.BottomSheetCallback() {
        @Override
        public void onStateChanged(@NonNull View bottomSheet, int newState) {
          switch (newState) {
            case BottomSheetBehavior.STATE_HIDDEN:
              finish();
              break;
          }
        }

        @Override
        public void onSlide(@NonNull View bottomSheet, float slideOffset) {
          // no op
        }
    });
  }
}
{% endhighlight %}

By now, we have pretty much achieved what we need. But details matter, and it shows we care about our user experience. Did you notice the strikingly bright status bar when the `Activity` is in peek mode? Its color follows `colorPrimary` attribute set in our theme. Easy, just set it to some dark color! But it will leave us with a dark status bar when the `Activity` fully expands.

Let's make it dynamic: we initially dim status bar when `Activity` first peek, undim it only when fully expanded, and dim again otherwise. Theming status bar is not supported pre-Lollipop so we can safely ignore it if device runs Kitkat or below.

{% highlight java %}
public class UserActivity extends AppCompatActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    ...
    setStatusBarDim(true);
    setContentView(R.layout.activity_user);
    findViewById(R.id.touch_outside).setOnClickListener(v -> finish());
    BottomSheetBehavior.from(findViewById(R.id.bottom_sheet))
      .setBottomSheetCallback(new BottomSheetBehavior.BottomSheetCallback() {
        @Override
        public void onStateChanged(@NonNull View bottomSheet, int newState) {
          switch (newState) {
            case BottomSheetBehavior.STATE_HIDDEN:
              finish();
              break;
            case BottomSheetBehavior.STATE_EXPANDED:
              setStatusBarDim(false);
              break;
            default:
              setStatusBarDim(true);
              break;
          }
        }
        ...
    });
  }

  private void setStatusBarDim(boolean dim) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      getWindow().setStatusBarColor(dim ? Color.TRANSPARENT :
        ContextCompat.getColor(this, getThemedResId(R.attr.colorPrimaryDark)));
    }
  }

  private int getThemedResId(@AttrRes int attr) {
    TypedArray a = getTheme().obtainStyledAttributes(new int[]{attr});
    int resId = a.getResourceId(0, 0);
    a.recycle();
    return resId;
  }
}
{% endhighlight %}

Check out our deep link bottom sheet in action:

<center>
  <iframe width="270" height="480" src="https://www.youtube-nocookie.com/embed/md_mkKZy1kk?rel=0" frameborder="0" allowfullscreen></iframe>
</center>

### Bottom sheet settings menu

[Materialistic] has a lot of settings for users to configure their reading experience. While a dedicated settings screen is useful to be the to-go page for this, more often we would want to save users a round trip to go back-forth between screens to change settings. Options menu[^7] is a good candidate for this. It comes with `Activity`/`Fragment`, and is declarative via XML.

But while serving well as a place to put simple settings, its monotonous style and being tighly controlled by framework and support library quickly make options menu feel like a make-shift choice for complex or more visual settings. One would need extra logic to handle its state, e.g. load from `SharedPreferences` and set checked state for a checkable group, save preferences to `SharedPreferences` when an item is selected. In the end, we end up with some less than satisfactory options menu:

<a href="/assets/img/bottom-sheet-2.png"><img src="/assets/img/bottom-sheet-2.png" class="img-responsive center-block img-thumbnail" /></a>
<figcaption>Monotonous multi-level options menu</figcaption>

Now you see where I'm going with this, how about a bottom sheet settings dialog! Combining `PreferenceFragmentCompat` - provided by [`preference-v7`](preference-v7) library - and `BottomSheetDialog`, plus a few tweaks to make a Spinner preference[^8], and we can achieve a much richer settings menu, right on the same screen: 

<a href="/assets/img/bottom-sheet-3.png"><img src="/assets/img/bottom-sheet-3.png" class="img-responsive center-block img-thumbnail" width="270" height="480" /></a>
<figcaption>Yes, I want to look at this all day!</figcaption>

TL;DR, what we need:

* A `DialogFragment` that hosts a `BottomSheetDialog`
* A `PreferenceFragmentCompat` that hosts the view for our preferences, which is included as a child fragment of the above
* Options menu logic to open our `DialogFragment`
* An `OnSharedPreferenceChangeListener` to react to changes in preferences

Let's first wire up logic to show the bottom sheet settings UI.

**layout/fragment_popup_settings.xml**
{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@id/content"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
{% endhighlight %}

**PopupSettingsFragment.java**
{% highlight java %}
public class PopupSettingsFragment extends AppCompatDialogFragment {
  @Nullable
  @Override
  public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
    return inflater.inflate(R.layout.fragment_popup_settings, container, false);
  }

  @Override
  public Dialog onCreateDialog(Bundle savedInstanceState) {
    return new BottomSheetDialog(getActivity(), getTheme());
  }

  @Override
  public void onActivityCreated(Bundle savedInstanceState) {
    super.onActivityCreated(savedInstanceState);
    if (savedInstanceState == null) {
      Fragment fragment = Fragment.instantiate(getActivity(),
        PreferenceFragment.class.getName(), getArguments());
      getChildFragmentManager()
        .beginTransaction()
        .add(R.id.content, fragment)
        .commit();
    }
  }

  public static class PreferenceFragment extends PreferenceFragmentCompat {
      @Override
      public void onCreatePreferences(Bundle bundle, String s) {
        addPreferencesFromResource(R.xml.my_preferences);
      }
    }
}
{% endhighlight %}

**ItemActivity.java**
{% highlight java %}
public class ItemActivity extends AppCompatActivity {
  @Override
  public boolean onOptionsItemSelected(MenuItem item) {
    if (item.getItemId() == android.R.id.settings) {
      openSettings();
      return true;
    }
    return super.onOptionsItemSelected(item);
  }

  private void openSettings() {
    ((DialogFragment) Fragment.instantiate(this, PopupSettingsFragment.class.getName()))
      .show(getSupportFragmentManager(), PopupSettingsFragment.class.getName());
  }
}
{% endhighlight %}

You gotta be kidding, it's not that easy right? Yes it's that easy! Now what remains is to listen and react to preferences changes.

**ItemActivity.java**
{% highlight java %}
public class ItemActivity extends AppCompatActivity {
  private final SharedPreferences.OnSharedPreferenceChangeListener mListener =
    (sharedPreferences, key) -> {
      handleSettingsChanged(key);
    };

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    PreferenceManager.getDefaultSharedPreferences(this)
      .registerOnSharedPreferenceChangeListener(mListener);
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();
    PreferenceManager.getDefaultSharedPreferences(this)
      .unregisterOnSharedPreferenceChangeListener(mListener);
  }

  private void handleSettingsChanged(String key) {
    // react to preferences change
  }
}
{% endhighlight %}

What about preferences state, e.g. initial state when open, saving from and loading preferences to UI? It should have already been taken care of by `PreferenceFragmentCompat` (or our custom `Preference`). And we're done. No more painful settings. One step closer to material design heaven!

### Supporting tablet users

Bottom sheets look great on phones. But when putting them on tablets, they feel stretched out, especially in landscape mode. It's due to the high ratio between peek height vs full tablet width. Details matter, and we want our tablet users as happy as phone users. Let's customize bottom sheet width for tablets.

{% highlight java %}
public class PopupSettingsFragment extends AppCompatDialogFragment {
  ...

  @Override
  public Dialog onCreateDialog(Bundle savedInstanceState) {
    return new CustomWidthBottomSheetDialog(getActivity(), getTheme());
  }

  static class CustomWidthBottomSheetDialog extends BottomSheetDialog {
    public CustomWidthBottomSheetDialog(@NonNull Context context, @StyleRes int theme) {
      super(context, theme);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      int width = getContext().getResources().getDimensionPixelSize(R.dimen.bottom_sheet_width);
      getWindow().setLayout(width > 0 ? width : ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT);
    }
  }
}
{% endhighlight %}

**values/dimens.xml**
{% highlight xml %}
<resources>
  <dimen name="bottom_sheet_width">0dp</dimen> <!-- MATCH_PARENT -->
</resources>
{% endhighlight %}

**values-w820dp/dimens.xml**
{% highlight xml %}
<resources>
  <dimen name="bottom_sheet_width">600dp</dimen>
</resources>
{% endhighlight %}

By putting desired width in respective resources directory with width qualifier[^9], we can now specify different bottom sheet width per device width, making it much more pleasant to look at on tablet:

<a href="/assets/img/bottom-sheet-4.png"><img src="/assets/img/bottom-sheet-4.png" class="img-responsive center-block img-thumbnail" width="640" height="480" /></a>
<figcaption>Bottom sheet on tablet</figcaption>

I'm sure there are more creative ways to make use of bottom sheet. Keen-eye hardcore Android users may notice that it looks somewhat like dialog in iOS now (minus the blurring glass background), but hell, what matters is the experience you're giving users here. Above are 2 applications of bottom sheet I found useful for [Materialistic]. It's open source as always, so check it out on [Github].

---
[^1]: [Bottom sheets](https://material.google.com/components/bottom-sheets.html) - Google design guidelines
[^2]: [Android support library 23.2](http://android-developers.blogspot.com/2016/02/android-support-library-232.html)
[^3]: [Intents and Intent Filters](https://developer.android.com/guide/components/intents-filters.html) - developer.android.com
[^4]: [Allowing other apps to start your Activity](https://developer.android.com/training/basics/intents/filters.html) - developer.android.com
[^5]: Fragmented cast - Google I/O 2016 [part 1](http://fragmentedpodcast.com/episodes/42/) and [2](http://fragmentedpodcast.com/episodes/43/)
[^6]: To make a translucent Activity, we need to set `windowIsTranslucent` and `windowBackground` theme atrributes. It is important to note that these attributes cannot be changed dynamically, so one needs to explicitly declare translucent `theme` in `AndroidManifest.xml`
[^7]: [Menus](https://developer.android.com/guide/topics/ui/menus.html) - developer.android.com
[^8]: [Building custom preferences with preference-v7]({% post_url 2015-11-30-building-custom-preferences-v7 %})
[^9]: [Providing Resources](https://developer.android.com/guide/topics/resources/providing-resources.html#AlternativeResources) - developer.android.com
[Materialistic]: https://play.google.com/store/apps/details?id=io.github.hidroh.materialistic
[preference-v7]: https://developer.android.com/topic/libraries/support-library/features.html#v7-preference
[Github]: https://github.com/hidroh/materialistic