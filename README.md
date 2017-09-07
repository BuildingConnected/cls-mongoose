# CLS shimmer for Mongoose

Adds CLS wrapper for Mongoose, making mongoose safe to use with [continuation-local-storage](https://github.com/othiym23/node-continuation-local-storage).

This is a fork of iliakan/cls-mongoose and feedhenry/cls-mongoose compatible with mongose >= 4.5.0.

I will try to maintain with new mongoose versions. If a new version is out and not supported please open an issue or submit a pull request.

Usage:

```js
var cls = require('continuation-local-storage');
var clsMongoose = require('fh-cls-mongoose');

// or cls.getNamespace if exists
var clsns = cls.createNamespace('app');

var mongoose = require('mongoose');
clsMongoose(clsns);
```

After `mongoose` is patched, use it as usual.
