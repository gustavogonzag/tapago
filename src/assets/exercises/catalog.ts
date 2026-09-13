const assets = import.meta.glob('./*.png', { eager: true, import: 'default' }) as Record<string, string>;

export function getExerciseImage(imageKey: string): string {
  return assets[`./${imageKey}.png`] ?? assets['./barbell-incline-bench.png'];
}
