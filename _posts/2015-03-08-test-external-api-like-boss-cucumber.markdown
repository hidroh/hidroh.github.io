---
layout: post
title:  "Test your external API like a boss with Cucumber"
date:   2015-03-08 2:40:34
summary: "Introducing an extension to Cucumber that allows BDD-style testing of API"
tags: bdd cucumber api testing ruby gem rubygem
---

If it is your first time hearing about [Cucumber](https://cukes.info/) or BDD in general, no sweat. In short, it allows you to specify your expectation in plain, readable text, meaning even your product managers can (almost) read and understand it!

<img src="https://cukes.info/images/feature.png" width="300px" />

<img src="https://cukes.info/images/pending.png" width="300px" />

However, what I like about Cucumber is less for this reason, but more for how scalable and maintainable it could be when your test suites grow over time, with features such as [tagging and filtering](https://github.com/cucumber/cucumber/wiki/Tags), [hooks](https://github.com/cucumber/cucumber/wiki/Hooks), [reusing steps](https://github.com/cucumber/cucumber/wiki/Calling-Steps-from-Step-Definitions), etc... I'll let you [find that out](https://github.com/cucumber/cucumber/wiki) yourself, hopefully you will grow fond of writing your own BDD specs!

### cucumber-api

It is almost unimaginable now that you can find a mobile app, be it Android, iOS, Windows Phone, Blackberry, (you-name-it) that does not make HTTP requests, specifically API requests, to retrieve data for it to gracefully display on mobile/tablet. In facts, apps are so dependent on external API now that most service providers either provide us with a RESTful API, or platform-specific SDKs to consume and manipulate the data they provide.

This means that regardless of your efforts to bullet-proof your app logic with an extensive set of unit tests, there would still be a high chance it may crash in production due to changes in your external API dependency. In many cases, it would be a 3rd-party provided API that you have no control over. But either way, being automatically informed when things go wrong is still more preferrable than when you get a 1-star rating with review saying app crashed, and later find out it is due to API change!

To address the above concerns, [cucumber-api](https://rubygems.org/gems/cucumber-api) extends [cucumber](https://github.com/cucumber/cucumber) to allow testing and verification of your API dependency in BDD style!

[![Total Downloads](http://ruby-gem-downloads-badge.herokuapp.com/cucumber-api?type=total)](https://rubygems.org/gems/cucumber-api)

By now you should have been inspired by the `Given-When-Then` pattern, let's try writing our API expectation in a similar fashion with **cucumber-api**:

{% highlight gherkin %}
Scenario: Verify top stories JSON schema
  When I send and accept JSON
  And I send a GET request to "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
  Then the response status should be "200"
{% endhighlight %}

That's cool! Now how about checking the item API with the first item ID retrieved from the above API?

{% highlight gherkin %}
Scenario Outline: Verify item JSON schema
  When I send and accept JSON
  And I send a GET request to "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
  Then the response status should be "200"
  And the JSON response root should be array
  When I grab "$[0]" as "id"
  And I send a GET request to "https://hacker-news.firebaseio.com/v0/item/{id}.json"
  Then the response status should be "200"
  And the JSON response root should be object
  And the JSON response should have <optionality> key "<key>" of type <value type>
  
  Examples:
    | key   | value type | optionality |
    | id    | numeric    | required    |
    | score | numeric    | required    |
    | url   | string     | optional    |
{% endhighlight %}

And that's just the beginning! Check the [documentation](https://github.com/hidroh/cucumber-api) to see what else you can do with **cucumber-api**. Once you have written a solid set of API expectation with **cucumber-api**, put them in as part of your daily/nightly build process and never be caught off guard by unexpected API changes again!  

*Note: Be careful with requests that may alter production data. Always think twice before you put them in, or make sure that any data alteration can be safely rolled back regardless of your test results.*

If you find yourself restricted with any of the functionalities, don't be shy, go ahead and make a [pull request](https://github.com/hidroh/cucumber-api/pulls)!

Get the [cucumber-api](https://rubygems.org/gems/cucumber-api) ruby gem now and be a boss!