import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const pkgDir = resolve(root, "node_modules", "expo-clipboard");

if (!existsSync(pkgDir)) {
  console.log("expo-clipboard not found – installing…");
  execSync("npx expo install expo-clipboard --fix", { cwd: root, stdio: "inherit" });
}
