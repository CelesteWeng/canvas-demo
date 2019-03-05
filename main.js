var canvas = document.getElementById('drawingBoard')
var context = canvas.getContext('2d')
var beginPoint = null
var points = []
var using = false
var eraserEnabled = false
var touchEnabled = !!('ontouchstart' in document.body)
console.log('你想被摸: ', touchEnabled)
var lineWidth = 5
penWidth.textContent = lineWidth

autoSetCanvasSize(canvas)

listenToUser(canvas)

eraser.onclick = function () {
  eraserEnabled = true
  eraser.classList.add('active')
  pen.classList.remove('active')
}
pen.onclick = function () {
  eraserEnabled = false
  pen.classList.add('active')
  eraser.classList.remove('active')
}
clear.onclick = function () {
  context.clearRect(0, 0, canvas.width, canvas.height)
}
download.onclick = function () {
  var a = document.createElement('a')
  var url = canvas.toDataURL('image/png')
  document.body.appendChild(a)
  a.href = url
  a.download = '名画'
  a.target = '_blank'
  a.click()
}
thin.onclick = function () {
  lineWidth = lineWidth > 2 ? lineWidth - 2 : lineWidth
  penWidth.textContent = lineWidth
}
thick.onclick = function () {
  lineWidth = lineWidth < 100 ? lineWidth + 2 : lineWidth
  penWidth.textContent = lineWidth
}
black.onclick = function () {
  changeColor('black')
}
red.onclick = function () {
  changeColor('red')
}
green.onclick = function () {
  changeColor('green')
}
blue.onclick = function () {
  changeColor('blue')
}

function changeColor(color) {
  context.strokeStyle = color
  Object.values(colors.children).map(function(t, index) {
    if (index > colors.children.length) return
    if (t.id != color) {
      t.className = ''
    } else {
      t.className = 'active'
    }
  })
}

// 设置画板大小
function autoSetCanvasSize(_canvas) {
  setCanvasSize()

  window.resize = function () {
    setCanvasSize()
  }

  function setCanvasSize() {
    _canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    _canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    context.fillStyle = 'white'
    context.fillRect(0, 0, _canvas.width, _canvas.height)
  }
}

// 获取坐标
function getPosition(e) {
  if (touchEnabled) {
    return { x: e.touches && e.touches[0] && e.touches[0].clientX, y: e.touches && e.touches[0] && e.touches[0].clientY }
  } else {
    return { x: e.clientX, y: e.clientY }
  }
}
// 绘制二次贝塞尔曲线
function drawLine(beginPoint, controlPoint, endPoint) {
  // 设置线条
  context.lineWidth = lineWidth
  context.lineCap = 'round'
  context.lineJoin = 'round'

  if (eraserEnabled) {
    context.clearRect(points[points.length - 1].x - 5, points[points.length - 1].y - 5, 10, 10);
  } else {
    context.beginPath()
    context.moveTo(beginPoint.x, beginPoint.y);
    // quadraticCurveTo(cp1x, cp1y, x, y)
    context.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
    context.stroke()
    context.closePath()
  }
}

function listenToUser(_canvas) {
  if (touchEnabled) {
    _canvas.ontouchstart = function (e) { down(e) }
    _canvas.ontouchmove = function (e) { move(e) }
    _canvas.ontouchend = function (e) { up(e) }
  } else {
    _canvas.onmousedown = function (e) { down(e) }
    _canvas.onmousemove = function (e) { move(e) }
    _canvas.onmouseup = function (e) { up(e) }
  }
}
function down(e) {
  using = true
  var { x, y } = getPosition(e)
  points.push({ x, y })
  beginPoint = { x, y }
  if (eraserEnabled) {
    drawLine()
  }
}
function move(e) {
  if (!using) return
  var { x, y } = getPosition(e)
  points.push({ x, y })

  if (points.length > 3) {
    let latestTwoPoints = points.slice(-2)
    let controlPoint = latestTwoPoints[0]
    let endPoint = {
      x: (latestTwoPoints[0].x + latestTwoPoints[1].x) / 2,
      y: (latestTwoPoints[0].y + latestTwoPoints[1].y) / 2
    }

    drawLine(beginPoint, controlPoint, endPoint)
    beginPoint = endPoint
  }
}
function up(e) {
  if (!using) return
  var { x, y } = getPosition(e)
  points.push({ x, y })

  if (points.length > 3) {
    let latestTwoPoints = points.slice(-2)
    let controlPoint = latestTwoPoints[0]
    let endPoint = latestTwoPoints[1]
    drawLine(beginPoint, controlPoint, endPoint)
  }

  beginPoint = null
  points = []
  using = false
}
