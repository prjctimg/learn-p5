## References

To reduce the amount of JavaScript between the user and the data they want, we generate a references.html file in advance. Each entry in the reference should comply with the standard JSDoc (or in the future LuaDoc)
of the project, wherein every function must have description and example,parameter tags as well as the return type to name a few.

```ts


type P5Symbol {
name:string
description:string 
example: string 
  // we expect any return values
returns: any
params:string[]
// e.g webgl,core  etc
module: string

//... and other parameters which may be optional and may not be available for every symbol


}

```

The URL scheme to reach a symbol's reference, from the "symbol briefing" exercise, is: `/ref/[moduleName]#[symbolName].html`, where `moduleName` is the name of the p5 module e.g `core` or `color` and `symbolName` is (obviously) the name of the symbol.

Each module has a standalone HTML file containing all its publicly exported symbols. This makes it easier to match the results we want without loading an entire JSON file or man page into memory which could slow up the app significantly especially as its uptime increases (programs tend to consume memory the longer they run, which is one reason why we "restart" apps and computers. To free resources.).

The symbols.json file is meant to  be very slim so that it can be used as a reference map for important params we need to pass to the `/ref` route.

Below is the schema

```

[moduleName]: { 
exports: string[]
}


```
