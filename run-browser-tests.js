import { createServer } from "vite";
import { readFileSync } from "fs";

const testHtml = readFileSync("./browser-tests.html", "utf-8");

// Credit to larsthorup/mocha-vite-puppeteer
const testHtmlPlugin = {
  name: "test-html",
  transformIndexHtml: {
    order: "pre",
    handler() {
      return testHtml;
    }
  }
};

const server = await createServer({
  configFile: false,
  plugins: [testHtmlPlugin],
  server: {
    port: 3000,
    hmr: false,
  },
  clearScreen: false,
})
await server.listen();

try {
  await new Promise(() => {});
} finally {
  await server.close();
}