import React from 'react';
import { motion } from 'framer-motion';

const RopeWaveText = () => {
    const text = "Because Every Patient Deserves a Seamless Experience";

    // Animation configuration
    const letterVariants = {
        animate: (i) => ({
            y: [0, -15, 0], // Moves up and down
            transition: {
                repeat: Infinity,
                duration: 3,
                rotate: [0, 5, 0], // Add this to variants
                ease: [0.4, 0, 0.2, 1], // More bouncy easing
                delay: i * 0.05, // Staggered delay
                // ease: "easeInOut",
            }
        })
    };

    return (
        <div className="flex justify-center overflow-hidden">
            <motion.div
                className="flex flex-wrap justify-center"
                initial="hidden"
                animate="visible"
            >
                {text.split('').map((char, i) => (
                    <motion.span
                        key={i}
                        custom={i}
                        variants={letterVariants}
                        animate="animate"
                        className="text-white lg:tracking-widest lg:font-bold text-xl inline-block"
                        style={{
                            transformOrigin: 'bottom center' // Makes the movement look more rope-like
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                ))}
            </motion.div>
        </div>
    );
};

export default RopeWaveText;