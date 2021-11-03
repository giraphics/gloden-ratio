import Gui from './ui/gui';
import Binding from './binder/binding';
import * as GoldenRatio from "./renderer/index";
import {TYPE_SIZE} from "./renderer/renderer/constants";
import ShapeTest from "./shapetest";

const binding = new Binding();
const gui = new Gui(binding);
let canvas: HTMLCanvasElement;
let canvasText: HTMLCanvasElement;
let canvas2: HTMLCanvasElement;
let camera: GoldenRatio.Camera;
let camera2: GoldenRatio.Camera;

var mouseHandling = function(canva: HTMLCanvasElement, cam: GoldenRatio.Camera){
	// ZOOM
    canva.onwheel = (event: WheelEvent) => {
		cam.z += event.deltaY / 100
	}

	// MOUSE DRAG
	var mouseDown = false;
	canva.onmousedown = (event: MouseEvent) => {
		mouseDown = true;

		lastMouseX = event.pageX;
		lastMouseY = event.pageY;
	}
	canva.onmouseup = (event: MouseEvent) => {
		mouseDown = false;
	}
	var lastMouseX=-1; 
	var lastMouseY=-1;
	canva.onmousemove = (event: MouseEvent) => {
		if (!mouseDown) {
			return;
		}

		var mousex = event.pageX;
		var mousey = event.pageY;

		if (lastMouseX > 0 && lastMouseY > 0) {
			const roty = mousex - lastMouseX;
			const rotx = mousey - lastMouseY;

			cam.rotY += roty / 100;
			cam.rotX += rotx / 100;
		}

		lastMouseX = mousex;
		lastMouseY = mousey;
	}	
}

window.onload = function(){
	// [Important] Let the GUI be executed first to create the canvas
	gui.start(binding);

	canvas = document.getElementById('webgpu-canvas') as HTMLCanvasElement;
	canvasText = document.getElementById('canvasText') as HTMLCanvasElement;
	const renderer = new GoldenRatio.Renderer(canvas, binding, 0);

	var ctx = canvasText.getContext("2d");

	renderer.initializeAPI().then((success) => {
		if (!success) return;

		const scene = new GoldenRatio.Scene();
		scene.add(new GoldenRatio.Particles(renderer.device, renderer.primitive, renderer.binding, GoldenRatio.PRIMITIVE_TYPE.POINT_LIST));
	
		// Camera
		camera = new GoldenRatio.Camera(canvas.width/ canvas.height);
        camera.z = 2;

		const doFrame = () => {
			renderer.render(scene, camera);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.strokeText("Parminder: ", 60.5, 60.5);
			requestAnimationFrame(doFrame);
		};
		requestAnimationFrame(doFrame);
	});
    
	// ZOOM
    canvas.onwheel = (event: WheelEvent) => {
		camera.z += event.deltaY / 100
	}

	// MOUSE DRAG
	var mouseDown = false;
	canvas.onmousedown = (event: MouseEvent) => {
		mouseDown = true;

		lastMouseX = event.pageX;
		lastMouseY = event.pageY;
	}
	canvas.onmouseup = (event: MouseEvent) => {
		mouseDown = false;
	}
	var lastMouseX=-1; 
	var lastMouseY=-1;
	canvas.onmousemove = (event: MouseEvent) => {
		if (!mouseDown) {
			return;
		}

		var mousex = event.pageX;
		var mousey = event.pageY;

		if (lastMouseX > 0 && lastMouseY > 0) {
			const roty = mousex - lastMouseX;
			const rotx = mousey - lastMouseY;

			camera.rotY += roty / 100;
			camera.rotX += rotx / 100;
		}

		lastMouseX = mousex;
		lastMouseY = mousey;
	}

	/***************************CANVAS*********************************/
	
	canvas2 = document.getElementById('webgpu-canvas2') as HTMLCanvasElement;

	const renderer2 = new GoldenRatio.Renderer(canvas2, binding, 1);
	renderer2.initializeAPI().then((success) => {
		if (!success) return;

		const scene2 = new GoldenRatio.Scene();
		const shapetest = new ShapeTest;
		let geometryCount: number = 360;
		const customGeom = new GoldenRatio.MultiGeometry(renderer2.device, GoldenRatio.PRIMITIVE_TYPE.TRIANGLE_LIST, geometryCount);
        scene2.add(customGeom);

		// Camera
		camera2 = new GoldenRatio.Camera(canvas.width / canvas.height);
        camera2.z = 12;
	
		let gc = 1;
		const doFrame2 = () => {
			shapetest.drawCubev36(customGeom, Math.floor(gc), .2, .2, .2);
			gc += 0.01;
			//shapetest.drawCubev8TriangleList(customGeom, 2000, .2, -.2, .2);
			// shapetest.drawCubev8Line(customGeom, 10, -.2, .2, .2);
			// shapetest.drawGrid(customGeom, 1);
			
			customGeom.updateBuffers();
			
			renderer2.render(scene2, camera2);
			customGeom.resetIndex();
			requestAnimationFrame(doFrame2);
		};
		requestAnimationFrame(doFrame2);
	});

	// ZOOM
    canvas2.onwheel = (event: WheelEvent) => {
		camera2.z += event.deltaY / 100
	}

	// MOUSE DRAG
	var mouseDown2 = false;
	canvas2.onmousedown = (event: MouseEvent) => {
		mouseDown2 = true;

		lastMouseX2 = event.pageX;
		lastMouseY2 = event.pageY;
	}
	canvas2.onmouseup = (event: MouseEvent) => {
		mouseDown2 = false;
	}
	var lastMouseX2=-1; 
	var lastMouseY2=-1;
	canvas2.onmousemove = (event: MouseEvent) => {
		if (!mouseDown2) {
			return;
		}

		var mousex2 = event.pageX;
		var mousey2 = event.pageY;

		if (lastMouseX2 > 0 && lastMouseY2 > 0) {
			const roty2 = mousex2 - lastMouseX2;
			const rotx2 = mousey2 - lastMouseY2;

			camera2.rotY += roty2 / 100;
			camera2.rotX += rotx2 / 100;
		}

		lastMouseX2 = mousex2;
		lastMouseY2 = mousey2;
	}
	///////////////////////////////////////////////////////////////////
}

