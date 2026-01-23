import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import stringImport from "rollup-plugin-string-import";
import replace from "@rollup/plugin-replace";

const production = !process.env.ROLLUP_WATCH;

export default [
    // Main build
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs',
                sourcemap: true
            },
            {
                file: 'dist/index.esm.js',
                format: 'es',
                sourcemap: true
            },
            {
                file: 'dist/index.umd.js',
                format: 'umd',
                name: 'CashierSDK',
                sourcemap: true
            }
        ],
        plugins: [
            replace({
                preventAssignment: true,
                values: {
                    __DEV__: JSON.stringify(false)
                }
            }),
            nodeResolve({
                browser: true,
                preferBuiltins: false
            }),
            commonjs(),
            stringImport({
                include: "**/*.html"
            }),
            typescript({
                tsconfig: './tsconfig.json',
                sourceMap: true
            }),
            production && terser()
        ]
    },
    // TypeScript declarations
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.d.ts',
            format: 'es'
        },
        plugins: [dts()]
    }
];