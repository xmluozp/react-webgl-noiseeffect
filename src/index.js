import React, { useEffect, useState } from 'react';
import NoiseEffect from './utils/effectClass.js';
import NoiseEffectColor from './utils/effectClassColor.js';


const NoiseEffectComponent = ({ images, id = 'canvas_noiseeffect', index, color, isColorful = false, display = true, density = 1, onLoad, blur = 1, speed = 1 }) => {

    const [effect, setEffect] = useState( isColorful? new NoiseEffectColor(images): new NoiseEffect(images));

    useEffect(() => { 
        effect.load(id, index, color ,display, density, blur ,onLoad);

        return () => {
            effect.unload();
        };
    }, [])

    useEffect(() => {
        effect.imgSwitch(index, 0.2 * speed);
    }, [index])

    useEffect(() => {
        if (display) {
            effect.fadeIn();
        } else {
            effect.fadeOut();
        }
    }, [display])

    useEffect(() => {
        effect.setBlur(blur);
    }, [blur])

    return (
        <canvas id={id}>
        </canvas>
    );
}


export default NoiseEffectComponent;