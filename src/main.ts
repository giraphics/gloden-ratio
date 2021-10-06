import Renderer from './renderer';
import Gui from './ui/gui';
import Binding from './binding';

const binding = new Binding();

const gui = new Gui(binding);
window.onload = function(){
	gui.start(binding);
}

const canvas = document.getElementById('webgpu-canvas') as HTMLCanvasElement;
canvas.width = canvas.height = 640;
const renderer = new Renderer(canvas, binding);
renderer.start();
