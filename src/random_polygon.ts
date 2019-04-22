function randomPolygon(count: number) {
  const vertexCount = (count != undefined) ? count: round(random(3, 10))
  
  const randomX: number[] = []
  const randomY: number[] = []
  
  for (let i = 0; i < vertexCount; i++) {
    randomX.push(random(-50, 50))
    randomY.push(random(-50, 50))
  }
  
  randomX.sort((lhs, rhs) => { return lhs - rhs })
  randomY.sort((lhs, rhs) => { return lhs - rhs })
 
  const minX: number = randomX.shift() as number
  const minY: number = randomY.shift() as number
  const maxX: number = randomX.pop() as number
  const maxY: number = randomY.pop() as number
  
  const forwardX = [minX]
  const backwardX = [minX]
  const forwardY = [minY]
  const backwardY = [minY]
  
  while (randomX.length > 0) {
    if (random([0, 1]) === 0) {
      forwardX.push(randomX.pop() as number)    
    } else {
      backwardX.push(randomX.pop() as number)
    }
    
    if (random([0,1]) === 0) {
      forwardY.push(randomY.pop() as number)
    } else {
      backwardY.push(randomY.pop() as number)
    }
  }
  
  forwardX.push(maxX)
  backwardX.push(maxX)
  forwardY.push(maxY)
  backwardY.push(maxY)
  
  const componentsX: number[] = []
  const componentsY: number[] = []
  
  for (let i = 0; i < forwardX.length - 1; i++) {
    componentsX.push(forwardX[i+1] - forwardX[i])
  }
  
  
  for (let i = backwardX.length - 1; i > 0; i--) {
    componentsX.push(backwardX[i - 1] - backwardX[i])
  }
  
  for (let i = 0; i < forwardY.length - 1; i++) {
    componentsY.push(forwardY[i+1] - forwardY[i])
  }
  
  
  for (let i = backwardY.length - 1; i > 0; i--) {
    componentsY.push(backwardY[i-1] - backwardY[i])
  }
  
  componentsX.sort(() => random() - 0.5)
  componentsY.sort(() => random() - 0.5)
  
  const vectors: Vector[] = []
  for (let i = 0; i < vertexCount; i++) {
    vectors.push(new Vector(componentsX[i], componentsY[i]))
  }
  
  vectors.sort((lhs, rhs) => atan2(lhs.x, lhs.y) - atan2(rhs.x, rhs.y))
  
  let current = new Vector()
  const vertices: Vector[] = []
  
  let polyMinX = Number.MAX_VALUE
  let polyMinY = Number.MAX_VALUE
  let polyMaxX = -Number.MAX_VALUE
  let polyMaxY = -Number.MAX_VALUE
  
  for (let i = 0; i < vectors.length; i++) {
    current = current.add(vectors[i])
    vertices.push(current)
    polyMinX = min(polyMinX, current.x)
    polyMaxX = max(polyMaxX, current.x)
    
    polyMinY = min(polyMinY, current.y)
    polyMaxY = max(polyMaxY, current.y)
  }

  let width = polyMaxX - polyMinX
  let height = polyMaxY - polyMinY
  
  let shift = new Vector((width / 2) - polyMaxX, (height / 2) -  polyMaxY)
  
  for (let i = 0; i < vertices.length; i++) {
    let v = vertices[i].add(shift)
    vertices[i] = v
  }
    
  return new Polygon(vertices)
}