# Courses are not vendored here

Course content lives in the separate
[learn-p5-content](https://github.com/prjctimg/learn-p5-content) repo and is
delivered to the app as a downloadable pack (see
`src/constants/Content.ts` and `src/contexts/ContentContext.tsx`).

The dev checks that validate that content
(`npm run check-exercises`, `npm run check-symbols`) read the sibling
`learn-p5-content` checkout instead, or `$LEARN_P5_CONTENT_DIR` when set.
