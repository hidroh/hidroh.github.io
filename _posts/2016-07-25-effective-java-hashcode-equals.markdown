---
layout: post
title:  "Effective Java #9"
date:   2016-07-25 04:30:34
description: "The (not so) curious case of hashCode() and equals()"
tags: java hashmap hashcode equals object
---

<div class="cap"></div>
As Java (or Android) developers, we use `Object` all the time. Java is an object-oriented programming language in the first place. We probably read/hear (more than once[^1] [^2] [^3]) that `equals()` and `hashCode()` should only be overriden together, as they affect hashtable operations. Let's do an interactive experiment to see what happens when one doesn't follow advice.

<!--more-->[ ](#){: id="more"}

First let's grab some official definitions. The Java language specification (Java SE 8) is quite brief on this:

<div class="bs-callout bs-callout-primary">
  <p>The method <code>equals</code> defines a notion of object equality, which is based on value, not reference, comparison.</p>
  <p>The method <code>hashCode</code> is very useful, together with the method equals, in hashtables such as <code>java.util.HashMap</code>.</p>
</div>

Effective Java item #9 has a more lengthy explanation of this contract, summing up that:

<div class="bs-callout bs-callout-primary">
  Always override <code>hashCode()</code> when you override <code>equals()</code>
</div>

The contract basically says that if 2 objects are `equals()`, they should have the same `hashCode()` value, but 2 objects having the same `hashCode()` value are not necessarily `equals()`.

## The experiment

Consider a common use case where we have a collection of items, each has an ID. An item is uniquely identified by its ID: if 2 items have the same ID, they are considered 'logically equivalent', and should be treated as being the same when we program using them. Let's represent such item using `Item` class, and use its instances as keys for map operations as follows:

{% highlight java %}
class Item {
  private final int id;

  Item(int id) {
    this.id = id;
  }
}

// for some funny reason, we create 3 instances
// that represent the same thing
Item item1 = new Item(1),
  item2 = new Item(1),
  item3 = new Item(1);
HashMap<Item, Integer> map = new HashMap<>();
map.put(item1, 1); // set value to 1
map.put(item2, 2); // override value to 2
map.put(new Item(100), 100); // some random entry
System.out.println(map.get(item1));
System.out.println(map.get(item2));
System.out.println(map.get(item3));
{% endhighlight %}

As our keys are supposed to represent the same item logically, the expected output to the 3 printouts are:

{% highlight text %}
2, 2, 2
{% endhighlight %}

## (Trivial) test runs

**TL;DR**

* Test 1: Don't override `hashCode()` and `equals()`
* Test 2: Override `hashCode()` only
* Test 3: Override `equals()` only
* Test 4: Override both `hashCode()` and `equals()`
* Test 5: What if `hashCode()` is random?
* Test 6: What if `hashCode()` is always the same?
* Test 7: And what if `equals()` is always false?
* Test 8: Okay what if `equals()` is always true now?

You can [skip to explanation](#explanation), or try to work out explanation for each test output as you read on.

**Test 1: Don't override `hashCode()` and `equals()`**

{% highlight java %}
class Item {
  private final int id;

  Item(int id) {
    this.id = id;
  }
}
{% endhighlight %}

{% highlight text %}
1, 2, null [FAILED]
{% endhighlight %}

**Test 2: Override `hashCode()` only**

{% highlight java %}
class Item {
    ...
    @Override
    public int hashCode() {
      return id;
    }
}
{% endhighlight %}

{% highlight text %}
1, 2, null [FAILED]
{% endhighlight %}

**Test 3: Override `equals()` only**

{% highlight java %}
class Item {
  ...
  @Override
  public boolean equals(Object obj) {
    return obj instanceof Item && id == ((Item) obj).id;
  }
}
{% endhighlight %}

{% highlight text %}
1, 2, null [FAILED]
{% endhighlight %}

**Test 4: Override both `hashCode()` and `equals()`**

{% highlight java %}
class Item {
  ...
  @Override
  public int hashCode() {
    return value;
  }
  
  @Override
  public boolean equals(Object obj) {
    return obj instanceof Item && id == ((Item) obj).id;
  }
}
{% endhighlight %}

{% highlight text %}
2, 2, 2 [PASSED]
{% endhighlight %}

**Test 5: What if `hashCode()` is random?**

{% highlight java %}
class Item {
  private static int staticInt;
  ...
  @Override
  public int hashCode() {
    return ++staticInt; // make sure each call gets a different value
  }
  
  @Override
  public boolean equals(Object obj) {
    return obj instanceof Item && id == ((Item) obj).id;
  }
}
{% endhighlight %}

{% highlight text %}
null, null, null [FAILED]
{% endhighlight %}

**Test 6: What if `hashCode()` is always the same?**

{% highlight java %}
class Item {
  ...
  @Override
  public int hashCode() {
    return 0;
  }
  
  @Override
  public boolean equals(Object obj) {
    return obj instanceof Item && id == ((Item) obj).id;
  }
}
{% endhighlight %}

{% highlight text %}
2, 2, 2 [PASSED]
{% endhighlight %}

**Test 7: And what if `equals()` is always false?**

{% highlight java %}
class Item {
  ...
  @Override
  public int hashCode() {
    return 0;
  }
  
  @Override
  public boolean equals(Object obj) {
    return false;
  }
}
{% endhighlight %}

{% highlight text %}
1, 2, null [FAILED]
{% endhighlight %}

**Test 8: Okay what if `equals()` is always true now?**

{% highlight java %}
class Item {
  ...
  @Override
  public int hashCode() {
    return 0;
  }
  
  @Override
  public boolean equals(Object obj) {
    return true;
  }
}
{% endhighlight %}

{% highlight text %}
100, 100, 100 [FAILED]
{% endhighlight %}

## Explanation

Well, if you need no more explanation for above results then congratulations, you have mastered `hashCode()`, `equals()` and how `HashMap` works. But in case you get confused at some point, then below is the explanation.

A little dig into internal implementation reveals that `HashMap` uses `hashCode()`, `==` and `equals()` for entry lookup. `HashMap` stores entries in buckets. Ideally each bucket should store 1 entry, and by looking up a bucket in O(1) time, one can get corresponding entry in O(1) time. In practice, many entries may end up in the same bucket.

The lookup sequence for a given key `k` is simplified as follows:

* Use `k.hashCode()` to determine which bucket the entry is stored, if any
* If found, for each entry's key `k1` in that bucket, if `k == k1 || k.equals(k1)`, then return `k1`'s entry
* Any other outcomes, no corresponding entry

Similar sequence applies for when an entry is put into `HashMap`.

Now, `hashCode()` is a native implementation, but its Javadoc says:

{% highlight java %}
/**
 * ...
 * As much as is reasonably practical, the hashCode method defined by
 * class Object does return distinct integers for distinct objects.
 * ...
 */
 public native int hashCode();
{% endhighlight %}

`equals()` implementation is much more straightforward:

{% highlight java %}
public boolean equals(Object obj) {
  return (this == obj);
}
{% endhighlight %}

So without overriding `hashCode()`, its output will be different for each `Item` object. Without overriding `equals()`, 2 `Item` objects that are logically equivalent would only be possible if they are represented by the same instance.

With that in mind, let's see how each test failed/passed:

* **[FAILED] Test 1: Don't override `hashCode()` and `equals()`**
  * As each key has a different `hashCode()` value, they end up in different buckets, and represent different entries, with different values.
* **[FAILED] Test 2: Override `hashCode()` only**
  * Our keys are in the same bucket now, but they end up representing different entries, due to failed `equals()` checks.
* **[FAILED] Test 3: Override `equals()` only**
  * Without overriding `hashCode()`, `HashMap` never gets to the point where it needs to do `equals()` checks. We get the same results as Test 1.
* **[PASSED] Test 4: Override both `hashCode()` and `equals()`**
  * Our keys are in the same bucket, and they represent the same entry, as either `==` or `equals()` checks passed.
* **[FAILED] Test 5: What if `hashCode()` is random?**
  * It's worse than not overriding `hashCode()`, as the same key object would end up in a different bucket every time we use it.
* **[PASSED] Test 6: What if `hashCode()` is always the same?**
  * Our code is functionally correct, but the use of `HashMap` is now redundant, as all entries will end up in the same bucket, regardless of their keys, which takes O(N) or O(logN)[^4] to iterate.
* **[FAILED] Test 7: And what if `equals()` is always false?**
  * It would be the same as not overriding `equals()`. We get the same results as Test 2.
* **[FAILED] Test 8: Okay what if `equals()` is always true now?**
  * We would be treating each key as logically equivalent to any other key, and thus any map operation will refer to the same entry.

I hope this trivial article now convinces you to follow Java language specification advice when overriding `hashCode()` and/or `equals()`. Effective Java[^2] item #9 provides much more informative insights, and you should absolutely grab the book and check it out as well.

---

[^1]: [Java language specification - Java SE 8 Edition](https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html#jls-4.3.2)
[^2]: [Effective Java - Joshua Bloch]( https://www.amazon.com/Effective-Java-2nd-Joshua-Bloch/dp/0321356683)
[^3]: [Fragmented Podcast 034 - Effective Java for Android Developers – Item #9](http://fragmentedpodcast.com/episodes/34/)
[^4]: [HashMap Performance Improvements in Java 8](https://dzone.com/articles/hashmap-performance)
