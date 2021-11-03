# Bloom
Create a 3D fractal tree garden in your space using WebXR.

---
### Setup
- `npm run build` to build
- `npm run develop` to spin up dev server

- use Web Server For Chrome to see it on ya phone https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en

---
## Motivation
- It is 2021 buzzword-du-jour is *metaverse*. I want to explore what a calm, natural metaverse might feel like rather than a shopping center mixed with an office.

- It is the COP26 climate summit during the week of writing so I thought putting some virtual trees into the world via immersive web technology was somewhat fitting.

- I am keen to explore WebXR and this is a great way to brush back up on three.js

---
##  Ongoing notes
- I started off by making a simple fractal tree in Processing using 2D vectors + lines + velocity. Converting this over to 3D was a bit tricky but understanding that nesting the branches in the three.js scenegraph is akin to `pushMatrix` and `popMatrix` in Processing mad everything a little clearer. 

- A magic moment was realising that nesting the branches in the tree structure of the three.js scenegraph is the key to making trees in 3D.