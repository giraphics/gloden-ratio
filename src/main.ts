import Renderer from './renderer';
import Gui from './ui/gui';
import Binding from './binding';

const binding = new Binding();

const gui = new Gui(binding);
window.onload = function(){
	gui.start(binding);
}

const canvas = document.getElementById('webgpu-canvas') as HTMLCanvasElement;
const renderer = new Renderer(canvas, binding);
renderer.start();

const canvas2 = document.getElementById('webgpu-canvas2') as HTMLCanvasElement;
const renderer2 = new Renderer(canvas2, binding);
renderer2.start();
