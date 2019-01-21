declare interface VideoInfo {
  aspect_ratio?: [number, number] | null;
  duration_millis?: number | null;
  variants?: VideoVariant[] | null;
}
