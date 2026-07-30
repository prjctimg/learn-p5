declare module "expo-clipboard" {
  export function setStringAsync(text: string): Promise<void>;
  export function getStringAsync(): Promise<string>;
  export function setImageAsync(image: string): Promise<void>;
  export function getImageAsync(options: { format: "png" | "jpeg"; quality?: number }): Promise<{ data: string; size: { width: number; height: number } } | null>;
  export function hasStringAsync(): Promise<boolean>;
  export function hasImageAsync(): Promise<boolean>;
  export function hasUrlAsync(): Promise<boolean>;
  export function setUrlAsync(url: string): Promise<void>;
  export function getUrlAsync(): Promise<string | null>;
}
