/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  semi: true,
  endOfLine: "lf",
  singleQuote: false,
};

export default config;
