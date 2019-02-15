Gronk
=====
Updated version of [Gron](https://github.com/fgribreau/gron) which makes JSON greppable, now also works as a Node module.

Unlike the Gron package, this version exports a function for use within code rather than just a binary tool.

**As a module within Node:**
```javascript
gronk({
	foo: {
		bar: {
			baz: [
				1,
				2,
				{
					quz: 'Quz!',
				},
			],
		},
	},
}) //=

foo = {}
foo.bar = {}
foo.bar.baz = []
foo.bar.baz.0 = 1
foo.bar.baz.1 = 2
foo.bar.baz.2 = {}
foo.bar.baz.2.quz = "Quz!"
```

**As a command line tool:**

```
> cat test/data/complex.json | gronk
foo = "Foo!"
bar = []
bar.0 = 1
bar.1 = 2
bar.2 = {}
bar.2.baz = []
bar.2.baz.0 = 1
bar.2.baz.1 = 2
bar.2.baz.2 = 3
quz = []
quz.0 = []
quz.0.0 = 10
quz.0.1 = 20
quz.0.2 = 30
quz.1 = 40
flarp = {}
flarp.boink = "Boink!"
```


Differences from Gron
----------------------
This module has a few differences from the standard Gron binary:

1. Path formatting uses dotted notation instead of JS notation. For example `foo.1.bar.2.baz` instead of `foo[1].bar[2].baz`. If you would like this format set `{dotted: true}` in the options.
2. Recursion detection (disable with `{detectRecursion: false}` if you really need to)
3. Type detection + serialization system - the base module provides a set of base types which can be expanded for custom output


API
===
This module exports two items, the main function and a `defaults` object which allows global alteration of the default settings.


gronk(data, [options])
----------------------
Accept a complex data object and return a dotted notation path + values.

Valid options are:

| Key               | Type       | Default    | Description                                                                                                                                  |
|-------------------|------------|------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `want`            | `string`   | `'string'` | How to return the output, values are `'array'`, `'object'` and `'string'`                                                                    |
| `dotted`          | `boolean`  | `true`     | Use dotted notation rather than JS notation                                                                                                  |
| `stubArray`       | `string`   | `'[]'`     | How to show the marker for an array entry, set this to falsy to disable                                                                      |
| `stubObject`      | `string`   | `'{}'`     | How to show the marker for an object entry, set this to falsy to disable                                                                     |
| `detectRecursion` | `boolean`  | `true`     | If recursion is detected, stop processing. Disable this only if you are absolutely sure the input is not circular                            |
| `baseTypes`       | `boolean`  | `true`     | Use the inbuilt type system which supports only Object, Array, String and Number if disabled the type system lookup gets used instead        |
| `typeDetail`      | `boolean`  | `false`    | Use full type values, rather than abbreivating them as a digest (If enabled buffers are output as full Base64 rather than just their length) |
| `format`          | `function` | See code   | Formatting function to use when processing each 'line', only used when want is 'array' or 'string'                                           |
| `formatPath`      | `function` | See code   | Formatting function to use to encode the path portion of each item                                                                           |
| `formatData`      | `function` | See code   | Formatting function to use to encode the data portion of each item                                                                           |
| `formatString`    | `function` | See code   | Used when want is 'string' to format a processed string, by default this just adds '\n' to the end                                           |
| `types`           | `array`    | See code   | Defines the type detection + serialization system when `{baseTypes: false}`                                                                  |


gronk.defaults
--------------
Object containing the global Gronk defaults.
