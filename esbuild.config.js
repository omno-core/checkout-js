import { context } from "esbuild";

const ctx = await context({
  entryPoints: ["src/examples/demo.ts", 'src/examples/tracking-bridge-demo.ts', 'src/examples/hpf-demo.ts'],
  bundle: true,
  outdir: "src/examples",
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
