import { context } from "esbuild";

const ctx = await context({
  entryPoints: ["src/examples/demo.ts"],
  bundle: true,
  outfile: "src/examples/demo.js",
  loader: {
    ".html": "text",
    ".css": "text"
  },
  define: {
    __DEV__: "true"
  }
});

await ctx.watch();
console.log("Watching for changes...");
