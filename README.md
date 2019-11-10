### Demo:

https://xmluozp.github.io/react-webgl-noiseeffect/

(This is a noise effect inspired from Kenji Saito: https://codepen.io/kenjiSpecial/pen/wavooR)

### What I did:
======
Reduced vertices for smaller icons to prevent to be choppy when presented with a number of elements.

Made it easier to be customized.

Wrapped it into a React component.

## Preconditions:
======
Images array is required.

Your picture's background has to be pure black or transparent (Black will be treated as transparent, other colors will be read as vertices). Pixel pictures perform best.

## Installation:
======
```
npm i react-webgl-noiseeffect
```

## Usage:
======
```javascript
import React, { useState } from 'react';
import './App.css';
import NoiseEffect from 'react-webgl-noiseeffect';

function App() {

  const [imageIndex, setImageIndex] = useState(0)
  const [display, setDisplay] = useState(true)

  const images = [
    { src: "images/01.png", width: 128, height: 128 },
    { src: "images/02.png", width: 128, height: 128 },
    { src: "images/03.png", width: 128, height: 128 },
  ]

  return (
    <div style={{background: '#000'}}>
      <NoiseEffect
        images={images}
        id="c"
        index={imageIndex}
        color="#A0B0FF"
        display={display}
        density={0.6}
        speed={0.5}
        onLoad={() => { console.log("loaded") }} />

      <div>
        <button onClick={() => { setImageIndex(0) }}>switch to 0</button>
        <button onClick={() => { setImageIndex(1) }}>switch to 1</button>
        <button onClick={() => { setImageIndex(2) }}>switch to 2</button>
        <button onClick={() => { setDisplay(false) }}>Fade Out</button>
        <button onClick={() => { setDisplay(true) }}>Fade In</button>
      </div>
    </div>
  );
}

export default App;

```

## Customize:
======
| Props         | Type          | Default             | Desc                                  |
| ------------- |:-------------:| -----:              | -----:                                |
| images        | Array         |  []                 | {src:string, width: int, height: int} |
| id            | String        |  canvas_noiseeffect | Used to locate the Canvas             |
| index         | int           |  0                  | Index of current displaing image      |
| color         | are neat      |  "#FFFFFF"          |                                       |
| display       | are neat      |    true             |                                       |
| density       | are neat      |    0.5              |                                       |
| speed         | are neat      |    1                | How fast of switching image           |
| onLoad        | are neat      |    null             | A Call back when the Canvas ready     |


