import Renderer from './renderer/renderer';
import Gui from './ui/gui';
import Binding from './binder/binding';
import { RenderObject } from './renderer/objects';
import { Scene } from './renderer/scene';

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
	
		const doFrame = () => {
			renderer.render(scene);
			requestAnimationFrame(doFrame);
		};
		requestAnimationFrame(doFrame);
	});

	const canvas2 = document.getElementById('webgpu-canvas2') as HTMLCanvasElement;
	const renderer2 = new Renderer(canvas2, binding, 1);
	renderer2.initializeAPI().then((success) => {
		if (!success) return;

		const scene2 = new Scene();
		scene2.add(new RenderObject(renderer2.device, renderer2.primitive, renderer2.binding));
	
		const doFrame2 = () => {
			renderer2.render(scene2);
			requestAnimationFrame(doFrame2);
		};
		requestAnimationFrame(doFrame2);
	});
}

