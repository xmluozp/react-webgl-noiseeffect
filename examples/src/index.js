import React, { useState } from 'react';
import { render } from 'react-dom';
import NoiseEffect from '../../src';


const App = () => {

    const [imageIndex, setImageIndex] = useState(0)
    const [imageIndexColor, setImageIndexColor] = useState(0)

    const [display, setDisplay] = useState(true)
    const [blur, setBlur] = useState(true)

    // const images = [
    //     { src: "examples/src/images/01.png", width: 128, height: 128 },
    //     { src: "examples/src/images/02.png", width: 128, height: 128 },
    //     { src: "examples/src/images/03.png", width: 128, height: 128 }
    // ]

    // const images2 = [
    //     { src: "examples/src/images/01.png", width: 128, height: 128 },
    //     { src: "examples/src/images/logo192.png", width: 128, height: 128 },
    // ]

    const images = [
        { src: "images/01.png", width: 128, height: 128 },
        { src: "images/02.png", width: 128, height: 128 },
        { src: "images/03.png", width: 128, height: 128 }
    ]

    const images2 = [
        { src: "images/01.png", width: 128, height: 128 },
        { src: "images/logo192.png", width: 128, height: 128 },
    ]

    return (
        <div>
            <h1 style={{color: 'white'}}> Single Color </h1>
            <NoiseEffect
                id="c"
                images={images}
                index={imageIndex}
                color="#A0B0FF"
                display={display}
                density={0.5}
                speed={0.5}
                onLoad={() => { console.log("loaded") }}
                blur={blur}
            />

            <div>
                <button onClick={() => { setImageIndex(0) }}>switch to 0</button>
                <button onClick={() => { setImageIndex(1) }}>switch to 1</button>
                <button onClick={() => { setImageIndex(2) }}>switch to 2</button>
                <button onClick={() => { setDisplay(false) }}>Fade Out</button>
                <button onClick={() => { setDisplay(true) }}>Fade In</button>
                <button onClick={() => { setBlur(3) }}>Blur(3)</button>
                <button onClick={() => { setBlur(1) }}>Blur(1)</button>
                <button onClick={() => { setBlur(0.5) }}>Blur(0)</button>
            </div>

            <h1 style={{color: 'white'}}> Original Color </h1>
            <NoiseEffect
                id="c2"
                images={images2}
                index={imageIndexColor}
                isColorful={true}
                display={true}
                density={0.5}
            />

            <div>
                <button onClick={() => { setImageIndexColor(0) }}>switch to 0</button>
                <button onClick={() => { setImageIndexColor(1) }}>switch to 1</button>
            </div>
        </div>
    );

};
render(<App />, document.getElementById("root"));