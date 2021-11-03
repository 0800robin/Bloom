import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import "./style.scss";
import stablise from "../assets/stabilization.gif";

import { Tree } from './tree';

const launchBtn = document.getElementById('launch');
document.getElementById('slam-img').src = stablise;

// check for the WebXR object in the navigator object
// this is how we sniff to see if WebXR is supported 
(async function() {
    const isWebXRSupported = 
        navigator.xr &&
        navigator.xr.isSessionSupported &&
        await navigator.xr.isSessionSupported('immersive-ar');

    if(isWebXRSupported) {
        console.log('web XR is supported!');

        launchBtn.addEventListener('click', async () => {
            app.activateXR();
        })
        
    } else {
        console.log('web xr is not supported.')
    }
})()

// our incredible new reality.
class World {
    constructor() {
		this.trees = []
    }

	/*
		Create an XR Session when we launch the experience
	*/
    activateXR = async () => {	
		// request an immersive-ar session + specify extra features
		this.XRSession = await navigator.xr.requestSession('immersive-ar', {
			requiredFeatures: ['hit-test', 'dom-overlay'],
			domOverlay: {
				root: document.body
			}
		});

		// add an event listener for when the session ends
		this.XRSession.addEventListener('end', this.onSessionEnded)

		// setup a WebGL canvas to draw everything on
		this.createXRCanvas();

		// once we're done, kick of the experience
		await this.onSessionStarted();
    }

	onSessionStarted = async () => {
		// Add the `ar` class to our body, which will hide our 2D components
		document.body.classList.add('ar');

		// To help with working with 3D on the web, we'll use three.js.
		this.setupThreeJs();

		// Setup an XRReferenceSpace which creates a 3D center point 
		// at the location the user opens the experience
		this.localReferenceSpace = await this.XRSession.requestReferenceSpace('local');

		// create another reference space which has the viewer as the origin
		this.viewerSpace = await this.XRSession.requestReferenceSpace('viewer')

		// setup hit testing using the viewer as the origin
		this.hitTestSource = await this.XRSession.requestHitTestSource({
			space: this.viewerSpace
		})

		// start a rendering loop
		this.XRSession.requestAnimationFrame(this.onXRFrame);

		// attach a callback to a screen tab event
		this.XRSession.addEventListener('select', this.onSelect);
	}

	onSessionEnded = () => {
		document.body.classList.remove('ar');
	}

	// execute this on each frame.
	onXRFrame = (time, frame) => {
		//// inspect the time + frame callback arguments
		// console.log(time, frame);

		// queue up the next draw request
		this.XRSession.requestAnimationFrame(this.onXRFrame);

		// Bind the graphics framebuffer to the baseLayer framebuffer
		// i.e. display the camera feed on the canvas.
		const framebuffer = this.XRSession.renderState.baseLayer.framebuffer;
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
		this.renderer.setFramebuffer(framebuffer);

		// get how is the camera positioned, rotated and orientated
		const pose = frame.getViewerPose(this.localReferenceSpace);


		this.trees.forEach((t) => {
			t.updateBranches()
		});

		// if there is a pose then the session has established tracking
		if(pose) {
			document.body.classList.remove('show-slam');

			// we only have one view in Mobile AR
			const view = pose.views[0];

			// set the baseLayer viewport to display across the entire canvas
			const viewport = this.XRSession.renderState.baseLayer.getViewport(view);
			this.renderer.setSize(viewport.width, viewport.height);

			// use the view's transform + projection matrix to configure THREE.js camera
			// i.e. make the phone position = three.js camera position
			this.camera.matrix.fromArray(view.transform.matrix);
			this.camera.projectionMatrix.fromArray(view.projectionMatrix);
			this.camera.updateMatrixWorld(true);

			// conduct a hit test! 
			const hitTestResults = frame.getHitTestResults(this.hitTestSource);
			
			// if we have hit tests
			if(hitTestResults.length > 0) {
				// find the pose based on the localreferencespace
				const hitPose = hitTestResults[0].getPose(this.localReferenceSpace)
				this.reticle.visible = true;
				this.reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z);
				this.reticle.updateMatrixWorld(true);
			} else {
				document.body.classList.add('show-slam');
			}

			// render the scene with THREE.WebGLRender
			this.renderer.render(this.scene, this.camera);
		} else {
			document.body.classList.add('show-slam');
		}
	}

	/*
		Create a canvas & initialise WebXR-compatible WebGL context 
	*/
	createXRCanvas = () => {
		this.canvas = document.createElement('canvas');
		document.body.appendChild(this.canvas);

		this.gl = this.canvas.getContext('webgl', {xrCompatible: true});

		// the baseLayer is the layer our camera feed + content is rendered on
		this.XRSession.updateRenderState({
			baseLayer : new XRWebGLLayer(this.XRSession, this.gl)
		})
	}

	/*
	* Create a three JS WebGLRenderer and demoscene
	*/
	setupThreeJs = () => {
		this.renderer = new  THREE.WebGLRenderer({
			alpha: true,
			preserveDrawingBuffer: true,
			canvas: this.canvas,
			context: this.gl
		})

		this.renderer.autoClear = false;

		// demo scene which creates some lighting
		this.scene = this.createLitScene();

		// create a new reticle and add it to the scene
		this.reticle = new Reticle();
		this.scene.add(this.reticle);

		// We'll update the camera matrices directly from API, so
		// disable matrix auto updates so three.js doesn't attempt
		// to handle the matrices independently.
		this.camera = new THREE.PerspectiveCamera();
		this.camera.matrixAutoUpdate = false;
	}

	onSelect = () => {
		console.log(this.reticle.position);
		const tree =  new Tree(this.reticle.position)
		this.trees.push(tree);
		this.scene.add(tree.mesh)
	}

	createLitScene() {
		const scene = new THREE.Scene();
	
		// The materials will render as a black mesh
		// without lights in our scenes. Let's add an ambient light
		// so our material can be visible, as well as a directional light
		// for the shadow.
		const light = new THREE.AmbientLight(0xffffff, 1);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
		directionalLight.position.set(10, 15, 10);
	
		// We want this light to cast shadow.
		directionalLight.castShadow = true;
	
		// Make a large plane to receive our shadows
		const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
		// Rotate our plane to be parallel to the floor
		planeGeometry.rotateX(-Math.PI / 2);
	
		// Create a mesh with a shadow material, resulting in a mesh
		// that only renders shadows once we flip the `receiveShadow` property.
		const shadowMesh = new THREE.Mesh(planeGeometry, new THREE.ShadowMaterial({
		  color: 0x111111,
		  opacity: 0.2,
		}));
	
		// Give it a name so we can reference it later, and set `receiveShadow`
		// to true so that it can render our model's shadow.
		shadowMesh.name = 'shadowMesh';
		shadowMesh.receiveShadow = true;
		shadowMesh.position.y = 10000;
	
		// Add lights and shadow material to scene.
		scene.add(shadowMesh);
		scene.add(light);
		scene.add(directionalLight);
	
		return scene;
	  }
}

class Reticle extends THREE.Object3D {
	constructor() {
		super();

		this.loader = new GLTFLoader();
		this.loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", (gltf) => {
			this.add(gltf.scene);
		})

		this.visible = false;
	}
}

const app = new World();