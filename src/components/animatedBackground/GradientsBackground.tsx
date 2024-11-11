"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";

import { Gradient } from "./gradients";

const gradient = new Gradient();

interface Props {
  showGradient?: boolean;
}

export const GradientBackground: React.FC<Props> = (props) => {
  const showGradient = props.showGradient ?? true;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (showGradient) {
      gradient.initGradient("#gradient-canvas");
    }
  }, [showGradient]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.opacity = "0";
      setTimeout(() => {
        canvas.style.transition = "opacity 2s";
        canvas.style.opacity = "1";
      }, 0);
    }

    return () => {
      if (canvas) {
        const context = canvas.getContext("2d");
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
  }, []);

  return (
    <canvas
      id="gradient-canvas"
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0 }}
    />
  );
};

export default GradientBackground;
