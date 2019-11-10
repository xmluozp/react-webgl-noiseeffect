import React, { useEffect } from 'react';
import NoiseEffect from './utils/effect.js';
import './styles.css';

const NoiseEffectComponent = ({ images, id = 'canvas_noiseeffect', index, color, display, density, onLoad, speed }) => {

    const effect = new NoiseEffect(images);

    useEffect(() => {
        
        effect.load(id, index, color ,display, density, onLoad);
        
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


    return (
        <canvas id={id}>
        </canvas>
    );
}


export default NoiseEffectComponent;