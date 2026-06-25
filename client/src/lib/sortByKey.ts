/** Returns a new array sorted by `key` descending, without mutating `items` — so charts tell a story (biggest first). */
export function sortDescendingBy<T, K extends keyof T>(items: T[], key: K): T[] {
  return [...items].sort((a, b) => Number(b[key]) - Number(a[key]))
}
