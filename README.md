# Waldi

[![Greenkeeper badge](https://badges.greenkeeper.io/foobert/gc-waldi.svg)](https://greenkeeper.io/)

Waldi is a tool to read GPX tracks and semi-automatically post found logs to
Geocaching.com

# Usage

It's a bit finicky and mostly suited to my personal needs.

You'll need to set the following environment variables:

* `GC_CONSUMER_KEY`
* `GC_USERNAME`
* `GC_PASSWORD`
* `GC_API_URI`

Consumer key, username and password are optional and if provided will be used to
automatically post logs to Geocaching.com.

The API URI is used to lookup geocaches from my [query server](https://github.com/foobert/gc-query).
