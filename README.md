

## Description:

*This is a noise effect inspired from Kenji Saito: https://codepen.io/kenjiSpecial/pen/wavooR*

Reduced vertices for smaller icons to prevent to be choppy when presented with a number of elements.

Made it easier to be customized.

Wrapped it into a React component.

Allow multiple icons.

## Demo:

https://xmluozp.github.io/react-webgl-noiseeffect/

## Preconditions:

Images array is required.

Your picture's background has to be pure black or transparent (Black will be treated as transparent, other colors will be read as vertices). Pixel pictures perform best.

## Installation:

```
npm i react-webgl-noiseeffect
```

## Usage:

1. Import

2. Create an Array of your images

3. Create a component, pass array in:

```javascript
import NoiseEffect from 'react-webgl-noiseeffect';

//...
  const images = [
    { src: "images/01.png", width: 128, height: 128 },
    { src: "images/02.png", width: 128, height: 128 },
    { src: "images/03.png", width: 128, height: 128 },
  ]
//...
    <NoiseEffect images={images} />
```


### Example:

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
    <div>
        <NoiseEffect
            id="c"
            images={images}
            index={imageIndex}
            color="#A0B0FF"
            display={display}
            density={0.6}
            speed={0.5}
            blur={blur}
            onLoad={() => { console.log("loaded") }}
        />

        <div>
            <button onClick={() => { setImageIndex(0) }}>switch to 0</button>
            <button onClick={() => { setImageIndex(1) }}>switch to 1</button>
            <button onClick={() => { setImageIndex(2) }}>switch to 2</button>
            <button onClick={() => { setDisplay(false) }}>Fade Out</button>
            <button onClick={() => { setDisplay(true) }}>Fade In</button>
            <button onClick={() => { setBlur(3) }}>Blur(3)</button>
            <button onClick={() => { setBlur(1) }}>Blur(1)</button>
            <button onClick={() => { setBlur(0.5) }}>Blur(0.5)</button>

        </div>
    </div>
  );
}

export default App;

```

## Customize:

| Props         | Type          | Default             | Desc                                  |
| ------------- | ------------- | ------------------- | ------------------------------------- |
| images        | Array         |  []                 | [{src:string, width: int, height: int}] |
| id            | String        | "canvas_noiseeffect"| id of Canvas, in case of multiple effects |
| index         | Integer       |  0                  | Index of current displaying image      |
| color         | String        |  "#FFFFFF"          |                                       |
| display       | Boolean       |    true             |                                       |
| density       | Float         |    0.5              |                                       |
| speed         | Float         |    1                | How fast of switching image           |
| blur          | Float         |    1                | How crazy are those points flying |
| onLoad        | Function      |    null             | A Call back when the Canvas ready     |


