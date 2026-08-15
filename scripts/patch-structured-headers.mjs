import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildGradle = join(
  __dirname,
  "..",
  "node_modules",
  "expo-structured-headers",
  "android",
  "build.gradle",
);

if (!existsSync(buildGradle)) {
  console.log("expo-structured-headers not installed, skipping patch");
  process.exit(0);
}

let content = readFileSync(buildGradle, "utf8");

const original = content;

content = content.replace("apply plugin: 'maven'\n", "");

content = content.replace(
  /uploadArchives \{[\s\S]*?\n\}\n/,
  "",
);

content = content.replace(
  /\/\/ Upload android library to maven with javadoc and android sources\n/,
  "",
);

if (content !== original) {
  writeFileSync(buildGradle, content, "utf8");
  console.log("Patched expo-structured-headers/android/build.gradle for Gradle 9+ compatibility");
} else {
  console.log("expo-structured-headers already patched, skipping");
}
