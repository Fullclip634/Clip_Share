import LZString from 'lz-string';

export const compressCode = (code: string): string => {
    return LZString.compressToEncodedURIComponent(code);
};

export const decompressCode = (compressed: string): string | null => {
    return LZString.decompressFromEncodedURIComponent(compressed);
};
