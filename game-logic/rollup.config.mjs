import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default {
	input: 'src/index.js',
	output: [
    {
      file: 'dist/cjs/index.js',
      format: 'cjs'
    },
    {
      file: 'dist/esm/index.js',
      format: 'es'
    },
  ],
  plugins: [
    commonjs(),
    terser(),
  ]
};