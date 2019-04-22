function clamp(minimum: number, maximum: number, value: number) {
  return min(max(minimum, value), maximum)
}

let lastId = 0

function unqiueId() {
  const id = lastId
  lastId++
  return id
}