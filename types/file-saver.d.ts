declare module 'file-saver' {
  export function saveAs(
    data: Blob | File | string | ArrayBuffer | Uint8Array,
    filename?: string,
    options?: any
  ): void;
  const _default: { saveAs: typeof saveAs };
  export default _default;
}

