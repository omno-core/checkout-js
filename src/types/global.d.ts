declare const __DEV__: boolean;

declare module "*.html" {
  const content: string;
  export default content;
}
