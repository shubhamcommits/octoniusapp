declare module 'libreoffice-convert' {
  function convert(
    document: string,
    format: string,
    filter: string | undefined, callback: (err: Error | undefined, any) => {}
  ): void;

  export = convert;
}