declare module "*.po" {
  const messages: { [key: string]: string };
  export { messages };
}