# p5.js v2 Public API Reference

This document lists all publicly exported symbols in p5.js v2, organized by module.
Symbols are shown as they appear in global mode (attached to `window`).

---

## Constants

| Symbol | Value |
|--------|-------|
| `VERSION` | version string |
| `P2D` | `'p2d'` |
| `WEBGL` | `'webgl'` |
| `WEBGL2` | `'webgl2'` |
| `ARROW` | `'default'` |
| `CROSS` | `'crosshair'` |
| `HAND` | `'pointer'` |
| `MOVE` | `'move'` |
| `TEXT` | `'text'` |
| `WAIT` | `'wait'` |
| `HALF_PI` | `PI / 2` |
| `PI` | `Math.PI` |
| `QUARTER_PI` | `PI / 4` |
| `TAU` | `PI * 2` |
| `TWO_PI` | `PI * 2` |
| `DEGREES` | `'degrees'` |
| `RADIANS` | `'radians'` |
| `DEG_TO_RAD` | `PI / 180` |
| `RAD_TO_DEG` | `180 / PI` |
| `CORNER` | `'corner'` |
| `CORNERS` | `'corners'` |
| `RADIUS` | `'radius'` |
| `RIGHT` | `'right'` |
| `LEFT` | `'left'` |
| `CENTER` | `'center'` |
| `TOP` | `'top'` |
| `BOTTOM` | `'bottom'` |
| `BASELINE` | `'alphabetic'` |
| `POINTS` | `0x0000` |
| `LINES` | `0x0001` |
| `LINE_STRIP` | `0x0003` |
| `LINE_LOOP` | `0x0002` |
| `TRIANGLES` | `0x0004` |
| `TRIANGLE_FAN` | `0x0006` |
| `TRIANGLE_STRIP` | `0x0005` |
| `QUADS` | `'quads'` |
| `QUAD_STRIP` | `'quad_strip'` |
| `TESS` | `'tess'` |
| `CLOSE` | `'close'` |
| `OPEN` | `'open'` |
| `CHORD` | `'chord'` |
| `PIE` | `'pie'` |
| `PROJECT` | `'square'` |
| `SQUARE` | `'butt'` |
| `ROUND` | `'round'` |
| `BEVEL` | `'bevel'` |
| `MITER` | `'miter'` |
| `RGB` | `'rgb'` |
| `HSB` | `'hsb'` |
| `HSL` | `'hsl'` |
| `AUTO` | `'auto'` |
| `ALT` | `18` |
| `BACKSPACE` | `8` |
| `CONTROL` | `17` |
| `DELETE` | `46` |
| `DOWN_ARROW` | `40` |
| `ENTER` | `13` |
| `ESCAPE` | `27` |
| `LEFT_ARROW` | `37` |
| `OPTION` | `18` |
| `RETURN` | `13` |
| `RIGHT_ARROW` | `39` |
| `SHIFT` | `16` |
| `TAB` | `9` |
| `UP_ARROW` | `38` |
| `BLEND` | `'source-over'` |
| `REMOVE` | `'destination-out'` |
| `ADD` | `'lighter'` |
| `DARKEST` | `'darken'` |
| `LIGHTEST` | `'lighten'` |
| `DIFFERENCE` | `'difference'` |
| `SUBTRACT` | `'subtract'` |
| `EXCLUSION` | `'exclusion'` |
| `MULTIPLY` | `'multiply'` |
| `SCREEN` | `'screen'` |
| `REPLACE` | `'copy'` |
| `OVERLAY` | `'overlay'` |
| `HARD_LIGHT` | `'hard-light'` |
| `SOFT_LIGHT` | `'soft-light'` |
| `DODGE` | `'color-dodge'` |
| `BURN` | `'color-burn'` |
| `THRESHOLD` | `'threshold'` |
| `GRAY` | `'gray'` |
| `OPAQUE` | `'opaque'` |
| `INVERT` | `'invert'` |
| `POSTERIZE` | `'posterize'` |
| `DILATE` | `'dilate'` |
| `ERODE` | `'erode'` |
| `BLUR` | `'blur'` |
| `NORMAL` | `'normal'` |
| `ITALIC` | `'italic'` |
| `BOLD` | `'bold'` |
| `BOLDITALIC` | `'bold italic'` |
| `CHAR` | `'CHAR'` |
| `WORD` | `'WORD'` |
| `LINEAR` | `'linear'` |
| `QUADRATIC` | `'quadratic'` |
| `BEZIER` | `'bezier'` |
| `CURVE` | `'curve'` |
| `STROKE` | `'stroke'` |
| `FILL` | `'fill'` |
| `TEXTURE` | `'texture'` |
| `IMMEDIATE` | `'immediate'` |
| `IMAGE` | `'image'` |
| `NEAREST` | `'nearest'` |
| `REPEAT` | `'repeat'` |
| `CLAMP` | `'clamp'` |
| `MIRROR` | `'mirror'` |
| `FLAT` | `'flat'` |
| `SMOOTH` | `'smooth'` |
| `LANDSCAPE` | `'landscape'` |
| `PORTRAIT` | `'portrait'` |
| `GRID` | `'grid'` |
| `AXES` | `'axes'` |
| `LABEL` | `'label'` |
| `FALLBACK` | `'fallback'` |
| `CONTAIN` | `'contain'` |
| `COVER` | `'cover'` |
| `UNSIGNED_BYTE` | `'unsigned-byte'` |
| `UNSIGNED_INT` | `'unsigned-int'` |
| `FLOAT` | `'float'` |
| `HALF_FLOAT` | `'half-float'` |
| `RGBA` | `'rgba'` |
| `VIDEO` | `'video'` |
| `AUDIO` | `'audio'` |

---

## Core

### Built-in Properties on `p5`

| Symbol | Description |
|--------|-------------|
| `p5.VERSION` | version string |
| `p5.disableFriendlyErrors` | toggle friendly error system |
| `p5.instance` | global-mode singleton reference |

### System Variables

| Variable | Description |
|----------|-------------|
| `frameCount` | number of frames drawn |
| `deltaTime` | time since last frame (ms) |
| `focused` | whether sketch has focus |
| `webglVersion` | current WebGL version |
| `displayWidth` | screen width |
| `displayHeight` | screen height |
| `windowWidth` | browser window width |
| `windowHeight` | browser window height |
| `width` | canvas width |
| `height` | canvas height |
| `pixelDensity()` | pixel density |
| `displayDensity()` | display pixel density |

### Functions

| Function | Description |
|----------|-------------|
| `print()` | print to console |
| `cursor(type, x, y)` | set cursor style |
| `frameRate(fps)` | get/set target frame rate |
| `getFrameRate()` | get current frame rate |
| `setFrameRate(fps)` | set target frame rate |
| `getTargetFrameRate()` | get target frame rate |
| `noCursor()` | hide cursor |
| `fullscreen(val)` | toggle fullscreen |
| `getURL()` | get current URL |
| `getURLPath()` | get URL path |
| `getURLParams()` | get URL query params |
| `createCanvas(w, h, renderer, canvas)` | create canvas |
| `resizeCanvas(w, h, noRedraw)` | resize canvas |
| `noCanvas()` | remove canvas |
| `createGraphics(w, h, ...)` | create off-screen buffer |
| `createFramebuffer(options)` | create framebuffer |
| `clearDepth(depth)` | clear depth buffer |
| `blendMode(mode)` | set blend mode |
| `noLoop()` | stop draw loop |
| `loop()` | start draw loop |
| `isLooping()` | check if looping |
| `push()` | save drawing state |
| `pop()` | restore drawing state |
| `redraw(n)` | redraw once |
| `applyMatrix(a, b, c, d, e, f)` | apply transformation matrix |
| `resetMatrix()` | reset transformation matrix |
| `rotate(angle, axis)` | rotate |
| `rotateX(angle)` | rotate around X |
| `rotateY(angle)` | rotate around Y |
| `rotateZ(angle)` | rotate around Z |
| `scale(x, y, z)` | scale |
| `shearX(angle)` | shear X |
| `shearY(angle)` | shear Y |
| `translate(x, y, z)` | translate |
| `remove()` | remove sketch from page |
| `registerMethod(name, fn)` | register lifecycle hook |
| `unregisterMethod(name, fn)` | unregister lifecycle hook |
| `registerPreloadMethod(fn, obj)` | register preload method |
| `pushStyle()` | use `push()` instead |
| `popStyle()` | use `pop()` instead |
| `pushMatrix()` | use `push()` instead |
| `popMatrix()` | use `pop()` instead |
| `describe(name, fallback)` | add accessibility description |
| `describeElement(name, fallback, el)` | describe a DOM element |
| `_describeHTML(name, fallback)` | internal describe helper |
| `_describeElementHTML(name, fallback, el)` | internal describe helper |
| `textOutput(display)` | enable text accessibility output |
| `gridOutput(display)` | enable grid accessibility output |
| `_addAccsOutput(type)` | internal accessibility helper |
| `_createOutput(display)` | internal accessibility helper |
| `_updateAccsOutput()` | internal accessibility helper |
| `_accsBackground()` | internal accessibility helper |
| `_accsCanvasColors()` | internal accessibility helper |
| `_accsOutput()` | internal accessibility helper |
| `_getPos(x, y, w, h)` | internal accessibility helper |
| `_getArea(x, y, w, h)` | internal accessibility helper |
| `_updateTextOutput()` | internal text output helper |
| `_updateGridOutput()` | internal grid output helper |
| `_rgbColorName(r, g, b)` | internal color naming helper |

### 2D Primitives

| Function | Description |
|----------|-------------|
| `arc(x, y, w, h, start, stop, mode, detail)` | draw arc |
| `ellipse(x, y, w, h, detailX)` | draw ellipse |
| `circle(x, y, r)` | draw circle |
| `line(x1, y1, x2, y2)` | draw line |
| `point(x, y)` | draw point |
| `quad(x1, y1, x2, y2, x3, y3, x4, y4)` | draw quadrilateral |
| `rect(x, y, w, h, tl, tr, br, bl)` | draw rectangle |
| `square(x, y, s, tl, tr, br, bl)` | draw square |
| `triangle(x1, y1, x2, y2, x3, y3)` | draw triangle |

### Shape Attributes

| Function | Description |
|----------|-------------|
| `ellipseMode(mode)` | set ellipse drawing mode |
| `noSmooth()` | disable smooth drawing |
| `rectMode(mode)` | set rect drawing mode |
| `smooth()` | enable smooth drawing |
| `strokeCap(cap)` | set stroke cap style |
| `strokeJoin(join)` | set stroke join style |
| `strokeWeight(w)` | set stroke weight |

### Curves

| Function | Description |
|----------|-------------|
| `bezier(x1, y1, x2, y2, x3, y3, x4, y4)` | draw bezier curve |
| `bezierDetail(detail)` | set bezier resolution |
| `bezierPoint(a, b, c, d, t)` | evaluate bezier at t |
| `bezierTangent(a, b, c, d, t)` | evaluate bezier tangent |
| `curve(x1, y1, x2, y2, x3, y3, x4, y4)` | draw curve |
| `curveDetail(detail)` | set curve resolution |
| `curveTightness(t)` | set curve tightness |
| `curvePoint(a, b, c, d, t)` | evaluate curve at t |
| `curveTangent(a, b, c, d, t)` | evaluate curve tangent |

### Vertex

| Function | Description |
|----------|-------------|
| `beginContour()` | begin contour |
| `beginShape(kind)` | begin shape |
| `bezierVertex(x1, y1, x2, y2, x3, y3)` | bezier vertex |
| `curveVertex(x, y)` | curve vertex |
| `endContour()` | end contour |
| `endShape(mode, count)` | end shape |
| `quadraticVertex(cx, cy, x, y)` | quadratic bezier vertex |
| `vertex(x, y, moveTo, u, v)` | add vertex |
| `normal(x, y, z)` | set normal |

### Classes

| Class | Description |
|-------|-------------|
| `p5.Element` | base class for DOM elements |
| `p5.Renderer` | base renderer class |
| `p5.Renderer2D` | 2D renderer |
| `p5.Graphics` | off-screen graphics buffer |

---

## Color

### Functions

| Function | Description |
|----------|-------------|
| `alpha(color)` | get alpha value |
| `blue(color)` | get blue value |
| `brightness(color)` | get HSB brightness |
| `color(...args)` | create a color |
| `green(color)` | get green value |
| `hue(color)` | get hue value |
| `lerpColor(c1, c2, amt)` | interpolate between colors |
| `paletteLerp(stops, amt)` | interpolate across palette |
| `lightness(color)` | get HSL lightness |
| `red(color)` | get red value |
| `saturation(color)` | get saturation value |
| `beginClip(options)` | begin clip mask |
| `endClip()` | end clip mask |
| `clip(callback, options)` | define clip via callback |
| `background(...args)` | set background |
| `clear(...args)` | clear canvas |
| `colorMode(mode, ...maxes)` | set color mode |
| `fill(...args)` | set fill color |
| `noFill()` | disable fill |
| `noStroke()` | disable stroke |
| `stroke(...args)` | set stroke color |
| `erase(fillAlpha, strokeAlpha)` | enable erasing |
| `noErase()` | disable erasing |

### Classes

| Class | Description |
|-------|-------------|
| `p5.Color` | color representation |

`p5.Color` instance methods:

| Method | Description |
|--------|-------------|
| `toString(format)` | string representation |
| `setRed(r)` | set red component |
| `setGreen(g)` | set green component |
| `setBlue(b)` | set blue component |
| `setAlpha(a)` | set alpha component |

`p5.ColorConversion` — internal color conversion utilities (not typically used directly).

---

## Math

### Functions

| Function | Description |
|----------|-------------|
| `abs(n)` | absolute value |
| `ceil(n)` | ceiling |
| `constrain(n, low, high)` | constrain value |
| `dist(x1, y1, x2, y2)` | distance between points |
| `exp(n)` | exponential |
| `floor(n)` | floor |
| `fract(n)` | fractional part |
| `lerp(start, stop, amt)` | linear interpolation |
| `log(n)` | natural logarithm |
| `mag(x, y, z)` | magnitude |
| `map(value, start1, stop1, start2, stop2)` | re-map value |
| `max(a, b, ...)` | maximum |
| `min(a, b, ...)` | minimum |
| `norm(value, start, stop)` | normalize |
| `pow(n, e)` | power |
| `round(n)` | round |
| `sq(n)` | square |
| `sqrt(n)` | square root |
| `createVector(x, y, z)` | create p5.Vector |

### Trigonometry

| Function | Description |
|----------|-------------|
| `acos(n)` | arccosine |
| `asin(n)` | arcsine |
| `atan(n)` | arctangent |
| `atan2(y, x)` | arctangent from coordinates |
| `cos(angle)` | cosine |
| `sin(angle)` | sine |
| `tan(angle)` | tangent |
| `degrees(radians)` | radians to degrees |
| `radians(degrees)` | degrees to radians |
| `angleMode(mode)` | set angle mode |

### Noise

| Function | Description |
|----------|-------------|
| `noise(x, y, z)` | Perlin noise |
| `noiseDetail(octaves, falloff)` | set noise detail |
| `noiseSeed(seed)` | seed noise generator |

### Random

| Function | Description |
|----------|-------------|
| `random(...args)` | random value |
| `randomSeed(seed)` | seed PRNG |
| `randomGaussian(mean, sd)` | Gaussian random |

### Class: `p5.Vector`

**Instance Methods**

| Method | Description |
|--------|-------------|
| `toString()` | string representation |
| `set(x, y, z)` | set components |
| `copy()` | create copy |
| `add(x, y, z)` | add |
| `rem(x, y, z)` | remainder (modulo) |
| `sub(x, y, z)` | subtract |
| `mult(n)` | multiply |
| `div(n)` | divide |
| `mag()` | magnitude |
| `magSq()` | squared magnitude |
| `dot(x, y, z)` | dot product |
| `cross(v)` | cross product |
| `dist(v)` | distance to vector |
| `normalize()` | normalize |
| `limit(max)` | limit magnitude |
| `setMag(n)` | set magnitude |
| `heading()` | 2D heading angle |
| `setHeading(a)` | set heading angle |
| `rotate(a)` | 2D rotation |
| `angleBetween(v)` | angle between vectors |
| `lerp(x, y, z, amt)` | linear interpolation |
| `slerp(v, amt)` | spherical linear interpolation |
| `reflect(surfaceNormal)` | reflect off surface |
| `array()` | return as array |
| `equals(x, y, z)` | check equality |
| `clampToZero()` | clamp near-zero components |

**Properties**

| Property | Type |
|----------|------|
| `x` | Number |
| `y` | Number |
| `z` | Number |

**Static Methods**

| Method | Description |
|--------|-------------|
| `p5.Vector.fromAngle(angle, length)` | create from angle |
| `p5.Vector.fromAngles(theta, phi, length)` | create from spherical angles |
| `p5.Vector.random2D()` | random 2D unit vector |
| `p5.Vector.random3D()` | random 3D unit vector |
| `p5.Vector.add(v1, v2, target)` | add two vectors |
| `p5.Vector.sub(v1, v2, target)` | subtract two vectors |
| `p5.Vector.mult(v, n, target)` | multiply vector |
| `p5.Vector.div(v, n, target)` | divide vector |
| `p5.Vector.dot(v1, v2)` | dot product |
| `p5.Vector.cross(v1, v2)` | cross product |
| `p5.Vector.dist(v1, v2)` | distance |
| `p5.Vector.lerp(v1, v2, amt, target)` | linear interpolation |
| `p5.Vector.slerp(v1, v2, amt, target)` | spherical linear interpolation |
| `p5.Vector.mag(vec)` | magnitude |
| `p5.Vector.magSq(vec)` | squared magnitude |
| `p5.Vector.normalize(v, target)` | normalize |
| `p5.Vector.limit(v, max, target)` | limit magnitude |
| `p5.Vector.setMag(v, len, target)` | set magnitude |
| `p5.Vector.heading(v)` | heading angle |
| `p5.Vector.angleBetween(v1, v2)` | angle between |
| `p5.Vector.reflect(v, n, target)` | reflect |
| `p5.Vector.rotate(v, a, target)` | rotate |
| `p5.Vector.array(v)` | to array |
| `p5.Vector.equals(v1, v2)` | equality check |
| `p5.Vector.rem(v1, v2)` | remainder |
| `p5.Vector.copy(v)` | copy vector |

---

## Data

### Functions

| Function | Description |
|----------|-------------|
| `createStringDict(key, value)` | create StringDict |
| `createNumberDict(key, value)` | create NumberDict |
| `storeItem(key, value)` | store in localStorage |
| `getItem(key)` | get from localStorage |
| `clearStorage()` | clear localStorage |
| `removeItem(key)` | remove from localStorage |

### Classes

| Class | Description |
|-------|-------------|
| `p5.TypedDict` | typed dictionary base class |
| `p5.StringDict` | string-keyed dictionary |
| `p5.NumberDict` | number-keyed dictionary |

---

## IO

### Functions

| Function | Description |
|----------|-------------|
| `loadJSON(path, callback, errorCallback)` | load JSON |
| `loadStrings(path, callback, errorCallback)` | load file lines |
| `loadTable(path, callback, errorCallback)` | load table |
| `loadXML(path, callback, errorCallback)` | load XML |
| `loadBytes(path, callback, errorCallback)` | load bytes |
| `httpGet(url, ...)` | HTTP GET |
| `httpPost(url, ...)` | HTTP POST |
| `httpDo(url, ...)` | HTTP request |
| `createWriter(name, extension)` | create PrintWriter |
| `save(object, filename)` | save file |
| `saveJSON(json, filename, optimize)` | save JSON |
| `saveJSONObject(json, filename, optimize)` | save JSON object |
| `saveJSONArray(array, filename, optimize)` | save JSON array |
| `saveStrings(list, filename)` | save string list |
| `saveTable(table, filename)` | save table |
| `writeFile(data, filename, type)` | write file |
| `downloadFile(data, filename, type)` | download file |

### Classes

| Class | Description |
|-------|-------------|
| `p5.PrintWriter` | file writer |
| `p5.Table` | data table |
| `p5.TableRow` | table row |
| `p5.XML` | XML document |

---

## DOM

### Functions

| Function | Description |
|----------|-------------|
| `select(selector)` | select first matching element |
| `selectAll(selector)` | select all matching elements |
| `removeElements()` | remove all DOM elements |
| `createDiv(content)` | create div |
| `createP(content)` | create paragraph |
| `createSpan(content)` | create span |
| `createImg(src, alt)` | create image |
| `createA(href, text)` | create link |
| `createSlider(min, max, value, step)` | create slider |
| `createButton(label, value)` | create button |
| `createCheckbox(label, value)` | create checkbox |
| `createSelect(options)` | create select dropdown |
| `createRadio(options)` | create radio buttons |
| `createColorPicker(value)` | create color picker |
| `createInput(value, type)` | create text input |
| `createFileInput(callback, multiple)` | create file input |
| `createVideo(src, ...)` | create video element |
| `createAudio(src, ...)` | create audio element |
| `createCapture(type, ...)` | create media capture |
| `createElement(tag, content)` | create generic element |

### Classes

| Class | Description |
|-------|-------------|
| `p5.MediaElement` | audio/video element |
| `p5.File` | file object |
| `VIDEO` | `'video'` type constant |
| `AUDIO` | `'audio'` type constant |

---

## Events

### Mouse

| Variable/Function | Description |
|-------------------|-------------|
| `movedX` | mouse X movement delta |
| `movedY` | mouse Y movement delta |
| `mouseX` | mouse X position |
| `mouseY` | mouse Y position |
| `pmouseX` | previous mouse X |
| `pmouseY` | previous mouse Y |
| `winMouseX` | window-relative mouse X |
| `winMouseY` | window-relative mouse Y |
| `pwinMouseX` | previous window-relative mouse X |
| `pwinMouseY` | previous window-relative mouse Y |
| `mouseButton` | which mouse button is pressed |
| `mouseIsPressed` | whether any mouse button is pressed |
| `requestPointerLock()` | request pointer lock |
| `exitPointerLock()` | exit pointer lock |

### Keyboard

| Variable/Function | Description |
|-------------------|-------------|
| `isKeyPressed` | whether a key is pressed |
| `keyIsPressed` | alias for isKeyPressed |
| `key` | most recent key |
| `keyCode` | code of most recent key |
| `keyIsDown(code)` | check if key is down |

### Touch

| Variable/Function | Description |
|-------------------|-------------|
| `touches` | array of touch objects |

### Acceleration

| Variable/Function | Description |
|-------------------|-------------|
| `deviceOrientation` | device orientation string |
| `accelerationX` | X acceleration |
| `accelerationY` | Y acceleration |
| `accelerationZ` | Z acceleration |
| `pAccelerationX` | previous X acceleration |
| `pAccelerationY` | previous Y acceleration |
| `pAccelerationZ` | previous Z acceleration |
| `rotationX` | rotation around X |
| `rotationY` | rotation around Y |
| `rotationZ` | rotation around Z |
| `pRotationX` | previous rotation X |
| `pRotationY` | previous rotation Y |
| `pRotationZ` | previous rotation Z |
| `turnAxis` | turn axis |
| `setMoveThreshold(threshold)` | set move threshold |
| `setShakeThreshold(threshold)` | set shake threshold |

---

## Image

### Functions

| Function | Description |
|----------|-------------|
| `createImage(w, h)` | create image |
| `saveCanvas(canvas, filename, format)` | save canvas |
| `saveFrames(prefix, ext, delay, framerate)` | save frames |
| `loadImage(path, callback, errorCallback)` | load image |
| `saveGif(filename, frames, options)` | save animated GIF |
| `image(img, x, y, w, h)` | draw image |
| `imageMode(mode)` | set image drawing mode |
| `tint(v1, v2, v3, a)` | set tint color |
| `noTint()` | disable tint |
| `blend(x0, y0, w0, h0, x1, y1, w1, h1, mode)` | blend pixels |
| `copy(x0, y0, w0, h0, x1, y1, w1, h1)` | copy pixels |
| `filter(filterType, param)` | apply filter |
| `get(x, y, w, h)` | get pixel/region |
| `loadPixels()` | load pixel data |
| `set(x, y, color)` | set pixel |
| `updatePixels(x, y, w, h)` | update pixels |
| `encodeAndDownloadGif(img, frameDelay, ...)` | encode and download GIF |

### Properties

| Variable | Description |
|----------|-------------|
| `pixels` | pixel array |

### Class: `p5.Image`

Image class with methods for pixel manipulation, drawing, and filtering.

---

## Typography

### Functions

| Function | Description |
|----------|-------------|
| `loadFont(path, callback, errorCallback)` | load font |
| `text(str, x, y, maxWidth, maxHeight)` | draw text |
| `textFont(font, size)` | set text font |
| `textAlign(horizAlign, vertAlign)` | set text alignment |
| `textLeading(leading)` | set text leading |
| `textSize(size)` | set text size |
| `textStyle(style)` | set text style |
| `textWidth(str)` | measure text width |
| `textAscent()` | get text ascent |
| `textDescent()` | get text descent |
| `textWrap(wrapStyle)` | set text wrapping |

### Class: `p5.Font`

Font class for loading and rendering fonts.

---

## Utilities

### Array Functions

| Function | Description |
|----------|-------------|
| `append(array, value)` | append to array |
| `arrayCopy(src, ...)` | copy array |
| `concat(a, b)` | concatenate arrays |
| `reverse(array)` | reverse array |
| `shorten(array)` | shorten array |
| `shuffle(array)` | shuffle array |
| `sort(array, compareFn)` | sort array |
| `splice(array, value, position)` | splice array |
| `subset(array, start, count)` | get subset |

### Conversion

| Function | Description |
|----------|-------------|
| `float(str)` | convert to float |
| `int(n, radix)` | convert to integer |
| `str(val)` | convert to string |
| `boolean(val)` | convert to boolean |
| `byte(val)` | convert to byte |
| `char(val)` | convert to char |
| `unchar(ch)` | convert char to code |
| `hex(val, digits)` | convert to hex string |
| `unhex(str)` | convert hex to number |

### String Functions

| Function | Description |
|----------|-------------|
| `join(list, separator)` | join array to string |
| `match(str, regexp)` | match regex |
| `matchAll(str, regexp)` | match all regex |
| `nf(nums, left, right)` | format number |
| `nfc(nums, right)` | format number with commas |
| `nfp(nums, left, right)` | format positive number |
| `nfs(nums, left, right)` | format number with sign |
| `split(str, delim)` | split string |
| `splitTokens(value, delims)` | split by tokens |
| `trim(str)` | trim whitespace |

### Time & Date

| Function | Description |
|----------|-------------|
| `day()` | current day |
| `hour()` | current hour |
| `minute()` | current minute |
| `millis()` | elapsed ms |
| `month()` | current month |
| `second()` | current second |
| `year()` | current year |

---

## WebGL

### 3D Primitives

| Function | Description |
|----------|-------------|
| `beginGeometry()` | begin recording geometry |
| `endGeometry()` | end recording geometry |
| `buildGeometry(callback)` | build geometry from callback |
| `freeGeometry(geometry)` | free geometry resources |
| `plane(w, h, detailX, detailY)` | draw plane |
| `box(w, h, d, detailX, detailY)` | draw box |
| `sphere(radius, detailX, detailY)` | draw sphere |
| `cylinder(radius, height, detailX, detailY)` | draw cylinder |
| `cone(radius, height, detailX, detailY)` | draw cone |
| `ellipsoid(radiusX, radiusY, radiusZ, detailX, detailY)` | draw ellipsoid |
| `torus(radius, tubeRadius, detailX, detailY)` | draw torus |

### Interaction

| Function | Description |
|----------|-------------|
| `orbitControl(sensitivityX, sensitivityY, sensitivityZ)` | orbit camera control |
| `debugMode(...)` | enable debug visualization |
| `noDebugMode()` | disable debug visualization |

### Lighting

| Function | Description |
|----------|-------------|
| `ambientLight(v1, v2, v3, a)` | ambient light |
| `specularColor(v1, v2, v3)` | specular color |
| `directionalLight(v1, v2, v3, x, y, z)` | directional light |
| `pointLight(v1, v2, v3, x, y, z)` | point light |
| `imageLight(img)` | image-based light |
| `panorama(img)` | set panorama |
| `lights()` | default lights |
| `lightFalloff(constant, linear, quadratic)` | light falloff |
| `spotLight(v1, v2, v3, x, y, z, dx, dy, dz, angle, concentration)` | spot light |
| `noLights()` | remove all lights |

### Shaders & Materials

| Function | Description |
|----------|-------------|
| `loadShader(vertSrc, fragSrc)` | load shader from files |
| `createShader(vertSrc, fragSrc, options)` | create shader from source |
| `createFilterShader(fragSrc)` | create filter shader |
| `shader(s)` | apply shader |
| `baseMaterialShader()` | reset to material shader |
| `baseNormalShader()` | reset to normal shader |
| `baseColorShader()` | reset to color shader |
| `baseStrokeShader()` | reset to stroke shader |
| `resetShader()` | reset to default shader |
| `texture(tex)` | apply texture |
| `textureMode(mode)` | set texture mode |
| `textureWrap(wrapX, wrapY)` | set texture wrapping |
| `normalMaterial(...args)` | normal material |
| `ambientMaterial(v1, v2, v3)` | ambient material |
| `emissiveMaterial(v1, v2, v3, a)` | emissive material |
| `specularMaterial(v1, v2, v3, a)` | specular material |
| `shininess(shine)` | set shininess |
| `metalness(metallic)` | set metalness |

### Camera

| Function | Description |
|----------|-------------|
| `camera(x, y, z, ...)` | set camera position |
| `perspective(fov, aspect, near, far)` | perspective projection |
| `linePerspective(enable)` | toggle line perspective |
| `ortho(left, right, bottom, top, near, far)` | orthographic projection |
| `frustum(left, right, bottom, top, near, far)` | frustum projection |
| `createCamera()` | create camera |
| `setCamera(cam)` | set active camera |

### Loading

| Function | Description |
|----------|-------------|
| `loadModel(path, options)` | load 3D model |
| `model(model)` | draw model |
| `createModel(modelString, fileType, options)` | create model from string |

### Attributes

| Function | Description |
|----------|-------------|
| `setAttributes(key, value)` | set WebGL attributes |

### Classes

| Class | Description |
|-------|-------------|
| `p5.Camera` | camera controller |
| `p5.Geometry` | 3D geometry |
| `p5.Matrix` | transformation matrix |
| `p5.Quat` | quaternion |
| `p5.Shader` | shader program |
| `p5.Texture` | texture |
| `p5.Framebuffer` | framebuffer object |
| `p5.FramebufferCamera` | framebuffer camera |
| `p5.FramebufferTexture` | framebuffer texture |
| `p5.RenderBuffer` | renderbuffer object |
| `p5.DataArray` | typed data array |
| `p5.RendererGL` | WebGL renderer |

Static methods on classes:

| Method | Description |
|--------|-------------|
| `p5.Matrix.identity()` | create identity matrix |
| `p5.Quat.fromAxisAngle(axis, angle)` | create quaternion from axis-angle |

---

## Accessibility

### Functions

| Function | Description |
|----------|-------------|
| `describe(name, fallback)` | add description to canvas |
| `describeElement(name, fallback, el)` | describe a DOM element |
| `textOutput(display)` | enable text-only output |
| `gridOutput(display)` | enable grid output |

---

## Summary by Module

| Module | Functions/Vars | Classes | Constants |
|--------|---------------|---------|-----------|
| Core | ~70 | 5 | ~105 |
| Color | ~20 | 2 | -- |
| Math | ~35 | 1 | -- |
| Data | ~6 | 3 | -- |
| IO | ~16 | 4 | -- |
| DOM | ~20 | 3 | 2 |
| Events | ~30 | -- | -- |
| Image | ~16 | 1 | -- |
| Typography | ~11 | 1 | -- |
| Utilities | ~30 | -- | -- |
| WebGL | ~50+ | 12 | -- |
| Accessibility | ~4 | -- | -- |
