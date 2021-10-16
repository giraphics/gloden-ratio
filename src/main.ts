import Renderer from './renderer/renderer';
import Gui from './ui/gui';
import Binding from './binder/binding';
import { RenderObject } from './renderer/objects';
import { Scene } from './renderer/scene';
import { Camera } from './renderer/camera';

const binding = new Binding();
const gui = new Gui(binding);

window.onload = function(){
	// [Important] Let the GUI be executed first to create the canvas
	gui.start(binding);

	const canvas = document.getElementById('webgpu-canvas') as HTMLCanvasElement;
	const renderer = new Renderer(canvas, binding, 0);

	renderer.initializeAPI().then((success) => {
		if (!success) return;

		const scene = new Scene();
		scene.add(new RenderObject(renderer.device, renderer.primitive, renderer.binding));
	
		// Camera
		const camera = new Camera(canvas.width/ canvas.height);
        camera.z = 2;

		const doFrame = () => {
			renderer.render(scene, camera);
			requestAnimationFrame(doFrame);
		};
		requestAnimationFrame(doFrame);
	});
    
	// // ZOOM
    // canvas.onwheel = (event: WheelEvent) => {
	// 	camera.z += event.deltaY / 100
	// }

	// // MOUSE DRAG
	// var mouseDown = false;
	// canvas.onmousedown = (event: MouseEvent) => {
	// 	mouseDown = true;

	// 	lastMouseX = event.pageX;
	// 	lastMouseY = event.pageY;
	// }
	// canvas.onmouseup = (event: MouseEvent) => {
	// 	mouseDown = false;
	// }
	// var lastMouseX=-1; 
	// var lastMouseY=-1;
	// canvas.onmousemove = (event: MouseEvent) => {
	// 	if (!mouseDown) {
	// 		return;
	// 	}

	// 	var mousex = event.pageX;
	// 	var mousey = event.pageY;

	// 	if (lastMouseX > 0 && lastMouseY > 0) {
	// 		const roty = mousex - lastMouseX;
	// 		const rotx = mousey - lastMouseY;

	// 		camera.rotY += roty / 100;
	// 		camera.rotX += rotx / 100;
	// 	}

	// 	lastMouseX = mousex;
	// 	lastMouseY = mousey;
	// }
	/////////////////////////////////////////////////////////////////////
	
	const canvas2 = document.getElementById('webgpu-canvas2') as HTMLCanvasElement;
	const renderer2 = new Renderer(canvas2, binding, 1);
	renderer2.initializeAPI().then((success) => {
		if (!success) return;

		const scene2 = new Scene();
		scene2.add(new RenderObject(renderer2.device, renderer2.primitive, renderer2.binding));

		// Camera
		const camera2 = new Camera(canvas.width/ canvas.height);
        camera2.z = 12;
	
		const doFrame2 = () => {
			renderer2.render(scene2, camera2);
			requestAnimationFrame(doFrame2);
		};
		requestAnimationFrame(doFrame2);
	});
}

