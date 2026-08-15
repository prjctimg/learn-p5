> # Learn P5

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](./LICENSE)
[![Android build](https://github.com/skchr/learn-p5/actions/workflows/release.yaml/badge.svg)](https://github.com/skchr/learn-p5/actions/workflows/release.yaml)
[![GitHub release](https://img.shields.io/github/v/release/skchr/learn-p5)](https://github.com/skchr/learn-p5/releases)

- [What is this ?](#what-is-this)
- [Who is this for ?](#who-is-this-for)
- [How can I try it out ?](#how-can-i-try-it-out)
- [Where can I see and share suggestions ?](#where-can-i-see-and-share-suggestions)
  - [Roadmap](#roadmap)
  - [License](#license)

>
> An offline first mobile app to learn p5.js through small (bite sized 🍣) exercises.
---

> [!WARNING]
> This app is still in development and this document is just a long rant to try and clarify stuff. Take it with a grain of salt

## What is this ?

Learn P5 is a mobile app to help users learn how p5.js symbols (functions, classes, built-in variables) work by showing users their sketch preview during the exercise. It is not a replacement for the p5 web editor which has far more comprehensive editing features.

This is a [GSoC 2026](https://summerofcode.withgoogle.com/programs/2026/projects/wmrV9qBT) project for the [Processing Foundation](https://processingfoundation.org).

## Who is this for ?

This app is intended for anyone who wants to learn p5.js at a relaxed pace that covers how each symbol works on the go, even without an internet connection to load resources such as the reference or web editor.

## How can I try it out ?

The app is currently available on Android only and ChromeOS if you are on the `dev` branch.

You can [grab the releases here](https://github.com/skchr/learn-p5/releases)

## Where can I see and share suggestions ?

There's a few GitHub Discussions that are open to suggestions and where we post feature previews (screenshots and the like).

More threads will be created as the project progresses:

- [Accessibility](https://github.com/skchr/learn-p5/discussions/1)

### Roadmap

This is an almost exhaustive list of the things we wish to complete during the program (they are not listed in any order of priority)

- [ ] Create a demo course using any p5.js module
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
- [ ] Allow users to preview sketches in full screen mode
- [ ] Support for the Friendly Error System (FES)
- [ ] Comply with basic accessibility requirements
- [ ] Add support for accessibility edge cases
- [ ] Save and store user state
- [ ] Track login streak and point system for certain actions such as completing  multiple exercises or module completion
- [ ] Create the first minigame
- [ ] Run the first minigame module
- [ ] Allow the user to sync progress between devices
- [ ] Improve the dashboard design
- [ ] Support for scheduled notifications
- [ ] Add support for sharing in-app links with rich OG data

> ### License
>
> This is free software released under the [GPL-3.0 license](./LICENSE)
