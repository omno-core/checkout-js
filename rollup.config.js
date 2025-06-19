// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const packageJson = require('./package.json');

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: packageJson.module,
                format: 'esm',
                sourcemap: true,
            },
            {
                file: packageJson.main,
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: 'dist/cashier-sdk.umd.js',
                format: 'umd',
                name: 'CashierSDK',
                sourcemap: true,
            },
            {
                file: 'dist/cashier-sdk.umd.min.js',
                format: 'umd',
                name: 'CashierSDK',
                sourcemap: true,
                plugins: [terser()],
            },
        ],
        plugins: [
            resolve({
                browser: true,
            }),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: false,
            }),
        ],
        external: [
            // Add any external dependencies here that shouldn't be bundled
            // For example: 'react', 'vue', etc.
        ],
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.d.ts',
            format: 'esm',
        },
        plugins: [dts()],
    },
];