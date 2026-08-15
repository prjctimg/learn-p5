export const PROCESSING_COLORS = [
 [237, 34, 93],
 [156, 39, 176],
 [33, 150, 243],
 [0, 150, 136],
 [255, 152, 0],
 [63, 81, 181],
 [0, 188, 212],
 [255, 87, 34],
 [76, 175, 80],
 [233, 30, 99],
] as const;

function rgbToHex(r: number, g: number, b: number): string {
 return (
 "#" +
 [r, g, b].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")
 );
}

export const PROCESSING_COLOR_HEX = PROCESSING_COLORS.map(([r, g, b]) => rgbToHex(r, g, b));
