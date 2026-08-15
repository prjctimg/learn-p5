> # Learn P5
>
> An offline first mobile app to learn p5.js through small (bite sized 🍣) exercises.
---

> [!WARNING]
> This app is still in development and this document is just a long rant to try and clarify stuff. Take it with a grain of salt

## What is this ?

Through a gamified approach to learning, we can help new users discover features of the library quicker by using a "visual REPL" approach.
Since `p5.js` is mostly for graphics, it makes a lot of sense to be able to play with the library and see the results immediately.

However, the library has a lot of symbols and understanding all the use cases and quirks of all them is a chore if you're starting out.
By designing exercises around its (publicly exported) modules, we can ensure that users understand the capabilities of the symbol.
If we look at how certain functions that have a variable length of parameters (where the omitted ones are passed defaults internally) such as `rect()`, they present the perfect scenario where the user may want to see the differences of calling with all the parameters or relying on default behaviour.

Besides that, there's a lot of preamble behind every `sketch` and sometimes it's not immediately obvious how the shown effects are achieved so giving references to sources of the applied concepts is a good way to guide users to learn further.

For example, links to math tutorials, Wikipedia and community blogs. See [this draft on dealing with references](./docs/references.md)

The expected outcome is a standalone app that can be installed on mobile smartphones starting with support for Android. Support for iOS would be nice after stability is achieved.

This is a [GSoC 2026]()  for the [Processing Foundation.]()

### Features (planned)

Here's some of the features we hope to have by the end. The list is subject to change as development reveals flaws.

- Offline reference for all the publicly exported symbols in the p5.js library.
- Support for alternative code snippets in other languages from other related projects (L5)
- A mini playground for creating lightweight sketches. Not a replacement for the web editor.
- Courses based on the library's modules
- Minigames!
- Points to unlock in-app features like alternative themes or app icon variants.

### Roadmap

This roadmap does not highlight the features directly but shows the stuff that would be nice to get out of the way ASAP

- [ ] Create a demo course using any p5.js module
- [ ] Extract symbol data for the reference (refer to [data.json]())
- [ ] Design the splash page
- [ ] Design the level/exercises overview
- [ ] Run a sketch in the app.
- [ ] Install and launch a build
- [ ] Design dashboard view and figure out the metrics to show
- [ ] Add support for (scheduled) notifications
- [ ] Design the logo. Can we have a mascot ?
- [ ] Port the existing design system from the (new) p5.js website
- [ ] Run the first mini game
- [ ] Compile a collection of minigames to implement with p5.js and community libraries
- [ ] Implement support for exporting gists from playground (user needs to link with GitHub)
- [ ] Support for login to help keep user progress

> ### License
>
> This is free software released under the [GPL-3.0 license](./LICENSE)
