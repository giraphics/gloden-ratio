import Renderer from './renderer';
import Gui from './ui/gui';

const gui = new Gui();
window.onload = function(){
	gui.start();
}

const canvas = document.getElementById('webgpu-canvas') as HTMLCanvasElement;
canvas.width = canvas.height = 640;
const renderer = new Renderer(canvas);
renderer.start();
