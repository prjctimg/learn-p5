## Using the Router API

The Expo Router API provides navigation management using a file-based routing system.

Currently the app will have the following routes:

- /dashboard
- /settings
- learn/[course]/[id]
- /playground
- /home (or the index route )
- /support
- /about
- /reference/[module]/[symbol]

## The route views (in detail)

### `/dashboard`

Here the user sees their progress and current rating, avatar (if it exists), their username.
It can also show other metrics such as streaks and other usage patterns.

They help keep the user informed about their current state in the app at a glance.

### `/settings`

This is where the user sets their preferences which persist even the app is restarted:

The most useful ones would be:

- Daily reminder
- Show snippet alternatives (useful for setting whether we want to show the variants of p5.js snippets in other languages e.g Lua using L5)
- Feedback
-  

### `/learn/[course]/[id]`

This view shows the lesson (`id`) in a particular `course`. The `/learn/[course]` index route shows the user all the available lessons in the `course`.

### `/playground`

An interactive playground to play with different parts of the p5.js library. It is not really optimized for complex sketches.

### `/onboarding/[slide]`

This route is shown the first time the app is ran or when the user resets  progress. It helps the user get started with the app and collects some basic info to understand the user's primary motivation to try the app.

### `/support`

This page contains help and info on how to report bugs or check the current known issues on the issue tracker on GitHub.

### `/about`

This describes briefly about the app and its inspirations.

## `/ref`

In the lesson descriptions, library symbols are shown as links which take the user to a `/ref/[symbol]` page that shows the information about a symbol and how it is used in a simple example.

> [!NOTE]
> It could also show some meta on where the symbol is found in the source, taking the user to GitHub if they wish to inspect the source.
