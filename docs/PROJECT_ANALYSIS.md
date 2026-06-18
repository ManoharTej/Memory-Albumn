# Project Analysis

## Overview
Memory Album is a highly interactive, 3D WebGL experience built to showcase photographs and memories in an immersive digital environment. Rather than a standard 2D grid of images, this project simulates a warm, dimly lit study room containing a physical "Memory Book". Users can flip through the pages, interact with the environment, and view memories exactly as if they were sitting at a real desk. 

## Purpose & Problem Solved
Traditional photo galleries are static and lack emotional resonance. This application solves the problem of presenting digital memories by wrapping them in an atmospheric, nostalgic, and deeply interactive 3D environment. It brings back the physical feeling of turning pages in a photo album, complete with dynamic lighting, interactive objects (like a wooden photo frame and animated butterflies), and post-processing visual effects.

## Features
- **Interactive 3D Study Room**: A fully modeled 3D environment including a desk, candles, and decorative items.
- **Physical Memory Book**: A 3D book with realistic page-flipping mechanics.
- **Animated Environment**: 3D butterflies that flutter organically around the scene and glowing fireflies.
- **Interactive Wooden Frame**: A side photo frame with functioning doors that can be clicked to open/close and zoom in.
- **In-App Camera/Capture**: Users can capture screenshots or record WebM videos of their experience directly from the 3D canvas.
- **Dynamic Lighting & Post-Processing**: Real-time shadows, glowing emissive materials (candles, fairy lights), and post-processing effects like Bloom, Vignette, and Noise.
- **Interactive Tutorial**: A step-by-step guided overlay to help new users navigate the 3D space.

## Technical Architecture & Decisions
- **Next.js & React 18/19**: Used for the core application framework, routing, and UI overlays.
- **Three.js & React Three Fiber (@react-three/fiber)**: The backbone of the 3D rendering engine, allowing declarative 3D scene building as React components.
- **React Three Postprocessing**: Used to achieve the "glowing" aesthetic with Bloom and atmospheric depth.
- **Zustand**: A lightweight state management library used to track the application state (e.g., whether the book is open, current page, tutorial progress) across both the 2D UI overlays and the 3D canvas.
- **GSAP & Anime.js**: Used for complex, timeline-based animations like the page-flipping mechanics and camera movements.
- **Tailwind CSS**: Used for styling the 2D HTML UI elements that overlay the 3D canvas.

## Setup Requirements
To run this project locally, ensure you have Node.js installed.
1. `npm install`
2. `npm run dev`
3. Access at `http://localhost:3000`

## Future Improvements
- Implement a backend (e.g., Supabase or Firebase) to allow users to dynamically upload their own photos.
- Add multiplayer functionality so multiple users can view the album simultaneously.
- Introduce spatial audio and ambient sound effects (page turning sounds, crackling candles).
- Enhance mobile responsiveness and touch-gesture controls for page flipping.
