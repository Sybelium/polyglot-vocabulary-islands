import { spawn } from "node:child_process";

const port = process.env.PORT || "3000";

const child = spawn(
  "node",
  ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", port],
  {
    stdio: "inherit",
    env: process.env,
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});