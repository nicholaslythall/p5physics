function clamp(minimum, maximum, value) {
  return min(max(minimum, value), maximum)
}

let lastId = 0

function unqiueId() {
  const id = lastId
  lastId++
  return id
}