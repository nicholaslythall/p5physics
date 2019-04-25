export function clamp(minimum: number, maximum: number, value: number) {
  return Math.min(Math.max(minimum, value), maximum)
}

let lastId = 0

export function unqiueId() {
  const id = lastId
  lastId++
  return id
}