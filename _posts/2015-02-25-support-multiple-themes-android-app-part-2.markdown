---
layout: post
title:  "Supporting multiple themes in your Android app (Part 2)"
date:   2015-02-25 3:40:34
summary: "Constructing theme and style resources to create a multiple-theme Android app"
tags: android resources theme styleable
---

In the [first part]({% post_url 2015-02-16-support-multiple-themes-android-app %}) of this post, we have created a light theme and made initial preparation to support multiple themes. In this blog post, we will continue that effort, creating another theme and allowing dynamic switching of themes during runtime.

Ideally, if we treat theme as a configuration, we should be able to specify theme-specific resources under a 'theme-qualifier' resources directory, e.g. `values-dark` for dark theme resources and `values-light` for light theme resources. Unfortunately, this is not yet an option at the time of this post.

So how should we specify resources for multiple themes? If we look at how resources are organized in [`appcompat`](https://github.com/android/platform_frameworks_support/blob/master/v7/appcompat/res/values/styles.xml), we will have a rough idea of how the Android team organize their theme specific resources. [Materialistic](https://play.google.com/store/apps/details?id=io.github.hidroh.materialistic) also employs a similar approach.

### Theming

**values/styles.xml**
{% highlight xml %}
<style name="AppTheme" parent="Theme.AppCompat.Light">
    <!-- original theme attributes -->
    ...
</style>

<style name="AppTheme.Dark" parent="Theme.AppCompat">
    <item name="colorPrimary">@color/colorPrimaryInverse</item>
    <item name="colorPrimaryDark">@color/colorPrimaryDarkInverse</item>
    <item name="colorAccent">@color/colorAccentInverse</item>
    <item name="android:textColorPrimary">@color/textColorPrimaryInverse</item>
    <item name="android:textColorSecondary">@color/textColorSecondaryInverse</item>
    <item name="android:textColorPrimaryInverse">@color/textColorPrimary</item>
    <item name="android:textColorSecondaryInverse">@color/textColorSecondary</item>
    ...
</style>
{% endhighlight %}

**values/colors.xml**
{% highlight xml %}
<!-- original color palette -->
...
<!-- alternative color palette -->
<color name="colorPrimaryInverse">...</color>
<color name="colorPrimaryDarkInverse">...</color>
<color name="colorAccentInverse">...</color>
{% endhighlight %}

Here we add a new dark theme called `AppTheme.Dark`, and for style and color consistency, we extend from `appcompat`'s theme `Theme.AppCompat` (a dark theme). Unfortunately, since our two themes extend two different base themes, we cannot share any common attributes (the same way a class in Java cannot extend two or more classes).

The two themes should have appropriate (different if applicable) values for base Android and [`appcompat`](https://github.com/android/platform_frameworks_support/blob/master/v7/appcompat/res/values/attrs.xml) theme attributes, e.g. `android:textColorPrimary` for dark theme should be light, and for light theme should be dark. By convention, here we suffix alternative theme colors with `Inverse`.  
*Tip: Try out your alternative theme by temporary switching `android:theme` for `application` in `AndroidManifest.xml` to see what extra colors/style you need to create. For certain cases a color may look okay in both dark and light theme.*

### Theme-specific resources

At this point, we should have a pretty decent dark theme for our app, except for some anomalies here and there, e.g. drawables used for action bar menu items. A dark action bar expects light-color menu items, and vice versa. In order to tell Android to use different drawables for different app themes, we create [custom attributes](http://developer.android.com/training/custom-views/create-view.html#customattr) that allow specifying reference to the correct drawable, and provide different drawable references as values for these custom attributes under different themes (the same way `appcompat` library provides custom attributes such as `colorPrimary`).

**values/attrs.xml**
{% highlight xml %}
<attr name="themedMenuStoryDrawable" format="reference" />
<attr name="themedMenuCommentDrawable" format="reference" />
...
{% endhighlight %}

**values/styles.xml**
{% highlight xml %}
<style name="AppTheme" parent="Theme.AppCompat.Light">
    <!-- original theme attributes -->
    ...
    <item name="themedMenuStoryDrawable">@drawable/ic_subject_white_24dp</item>
    <item name="themedMenuCommentDrawable">@drawable/ic_mode_comment_white_24dp</item>
</style>

<style name="AppTheme.Dark" parent="Theme.AppCompat">
    <!-- alternative theme attributes -->
    ...
    <item name="themedMenuStoryDrawable">@drawable/ic_subject_black_24dp</item>
    <item name="themedMenuCommentDrawable">@drawable/ic_mode_comment_black_24dp</item>
</style>
{% endhighlight %}

**menu/my_menu.xml**
{% highlight xml %}
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:id="@id/menu_comment"
        android:icon="?attr/themedMenuCommentDrawable" />
    <item android:id="@id/menu_story"
        android:icon="?attr/themedMenuStoryDrawable" />
    <item android:id="@id/menu_share"
        app:actionProviderClass="android.support.v7.widget.ShareActionProvider" />
</menu>
{% endhighlight %}

Similar implementation can be used to specify most custom attributes you need for theme specific resource values. One hiccup to this approach is that attribute resolving in drawable resources seems to be broken before API 21. For example, if you have a drawable which is a `layer-list` of colors, their values must be fixed for API <21. See [this commit](https://github.com/google/iosched/commit/dd7ed72a7eb2d223203db079bd99d31c6ef3061e) from Google I/O 2014 app for a fix.

An alternative approach to avoid duplicating drawable resources for different themes is to use drawable `tint`. This attribute is available from API 21. [Dan Lew in his blog](http://blog.danlew.net/2014/08/18/fast-android-asset-theming-with-colorfilter/) shows how to do this for all API levels. Personally I would prefer to keep my Java implementation free of view logic if possible, so I choose to have different drawable resources per theme.

### Dynamic theme switching

Now that we have two polished themes ready to be used, we need to allow users to choose which one they prefer and switch theme dynamically during runtime. This can be done by having a `SharedPreferences`, says `pref_dark_theme` to store theme preference and use its value to decide which theme to apply. Application of theme should be done for all activies, before their views are created, so `onCreate()` is our only option to put the logic.

**BaseActivity.java**
{% highlight java %}
public abstract class BaseActivity extends ActionBarActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        if (PreferenceManager.getDefaultSharedPreferences(this)
                .getBoolean("pref_dark_theme"), false)) {
            setTheme(R.style.AppTheme_Dark);
        }
        super.onCreate(savedInstanceState);
    }
}
{% endhighlight %}

Here, since our app already has a default light theme, we only need to check if default preference has been overriden to override dark theme. The logic is put in the 'base' activity so it can be shared by all activities.

Note that this approach will only apply theme for activities that are not in the [back stack](http://developer.android.com/guide/components/tasks-and-back-stack.html). For those that are already in current stack, they will still exhibit previous theme, as going back will only trigger `onResume()`. Depends on product requirements, the implementation to handle these 'stale' screens can be as simple as clearing the back stack, or restarting every single activity in the back stack upon preference change. Here we simply clear back stack and restart current activity upon theme change.

**SettingsFragment.java**
{% highlight java %}
public class SettingsFragment extends PreferenceFragment {
    ...

    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        mListener = new SharedPreferences.OnSharedPreferenceChangeListener() {
            @Override
            public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
                if (!key.equals("pref_dark_theme")) {
                    return;
                }

                getActivity().finish();
                final Intent intent = getActivity().getIntent();
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | IntentCompat.FLAG_ACTIVITY_CLEAR_TASK);
                getActivity().startActivity(intent);
            }
        };
    }

    ...
{% endhighlight %}

So that's it. Now we have an app with two polished themes for even the most picky users! Head over to [hidroh/materialistic](https://github.com/hidroh/materialistic) GitHub repository to checkout complete implementation!