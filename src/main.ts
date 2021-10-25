import Gui from './ui/gui';
import Binding from './binder/binding';
import * as GoldenRatio from "./renderer/index";
import ShapeTest from "./shapetest";

const binding = new Binding();
const gui = new Gui(binding);
let canvas: HTMLCanvasElement;
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

let createCustomGeometry: (renderer2: GoldenRatio.Renderer) => GoldenRatio.CustomGeometry = function (renderer2: GoldenRatio.Renderer): GoldenRatio.CustomGeometry {
	let geometryVertexArray = new Float32Array([
		// float4 position, float4 color, float2 uv,
		-1, -1, -1, 1,   1, 0, 1, 1,  1, 1, // -> 0
		-1, -1, 1, 1,  0, 0, 1, 1,  0, 1,   // -> 1
		1, -1, -1, 1, 0, 0, 0, 1,  0, 0,    // -> 2
		1, -1, 1, 1,  1, 0, 0, 1,  1, 0,    // -> 3
		-1, 1, -1, 1,   1, 0, 1, 1,  1, 1,  // -> 4
		-1, 1, 1, 1,  0, 0, 1, 1,  0, 1,    // -> 5
		1, 1, -1, 1, 0, 0, 0, 1,  0, 0,     // -> 6
		1, 1, 1, 1,  1, 0, 0, 1,  1, 0,     // -> 7
	]);

	// For Index its must be a strip
	let geometryIndexArray = new Uint16Array([
		0, 1, 2, 2, 1, 3, 0xFFFF,
		4, 5, 6, 6, 5, 7, 0xFFFF,
		0xFFFF, 0xFFFF,
	 ]);
	const customGeom = new GoldenRatio.CustomGeometry(renderer2.device, 1, GoldenRatio.PRIMITIVE_TYPE.TRIANGLE_STRIP, true);
	customGeom.allocate(geometryVertexArray, geometryIndexArray);
	return customGeom;
};

let discreteCubeGeometry: (renderer2: GoldenRatio.Renderer) => GoldenRatio.CustomGeometry = function (renderer2: GoldenRatio.Renderer): GoldenRatio.CustomGeometry {
	let geometryVertexArray = new Float32Array([
	    // float4 position, float4 color, float2 uv,
		1, -1, 1, 1,   1, 0, 1, 1,  1, 1,
		-1, -1, 1, 1,  0, 0, 1, 1,  0, 1,
		-1, -1, -1, 1, 0, 0, 0, 1,  0, 0,
		1, -1, -1, 1,  1, 0, 0, 1,  1, 0,
		1, -1, 1, 1,   1, 0, 1, 1,  1, 1,
		-1, -1, -1, 1, 0, 0, 0, 1,  0, 0,

		1, 1, 1, 1,    1, 1, 1, 1,  1, 1,
		1, -1, 1, 1,   1, 0, 1, 1,  0, 1,
		1, -1, -1, 1,  1, 0, 0, 1,  0, 0,
		1, 1, -1, 1,   1, 1, 0, 1,  1, 0,
		1, 1, 1, 1,    1, 1, 1, 1,  1, 1,
		1, -1, -1, 1,  1, 0, 0, 1,  0, 0,

		-1, 1, 1, 1,   0, 1, 1, 1,  1, 1,
		1, 1, 1, 1,    1, 1, 1, 1,  0, 1,
		1, 1, -1, 1,   1, 1, 0, 1,  0, 0,
		-1, 1, -1, 1,  0, 1, 0, 1,  1, 0,
		-1, 1, 1, 1,   0, 1, 1, 1,  1, 1,
		1, 1, -1, 1,   1, 1, 0, 1,  0, 0,

		-1, -1, 1, 1,  0, 0, 1, 1,  1, 1,
		-1, 1, 1, 1,   0, 1, 1, 1,  0, 1,
		-1, 1, -1, 1,  0, 1, 0, 1,  0, 0,
		-1, -1, -1, 1, 0, 0, 0, 1,  1, 0,
		-1, -1, 1, 1,  0, 0, 1, 1,  1, 1,
		-1, 1, -1, 1,  0, 1, 0, 1,  0, 0,

		1, 1, 1, 1,    1, 1, 1, 1,  1, 1,
		-1, 1, 1, 1,   0, 1, 1, 1,  0, 1,
		-1, -1, 1, 1,  0, 0, 1, 1,  0, 0,
		-1, -1, 1, 1,  0, 0, 1, 1,  0, 0,
		1, -1, 1, 1,   1, 0, 1, 1,  1, 0,
		1, 1, 1, 1,    1, 1, 1, 1,  1, 1,

		1, -1, -1, 1,  1, 0, 0, 1,  1, 1,
		-1, -1, -1, 1, 0, 0, 0, 1,  0, 1,
		-1, 1, -1, 1,  0, 1, 0, 1,  0, 0,
		1, 1, -1, 1,   1, 1, 0, 1,  1, 0,
		1, -1, -1, 1,  1, 0, 0, 1,  1, 1,
		-1, 1, -1, 1,  0, 1, 0, 1,  0, 0,
	]);

	// For Index its must be a strip
	let geometryIndexArray = new Uint16Array([
		0, 1, 2, 3, 4, 5,
		6, 7, 8, 9, 10, 11,
		12, 13, 14, 15, 16, 17,
		18, 19, 20, 21, 22, 23,
		24, 25, 26, 27, 28, 29,
		30, 31, 32, 33, 34, 35, 0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF
	]);
	const customGeom = new GoldenRatio.CustomGeometry(renderer2.device, 1, GoldenRatio.PRIMITIVE_TYPE.TRIANGLE_STRIP, true);
	customGeom.allocate(geometryVertexArray, geometryIndexArray);
	return customGeom;
};

let createCustomGeometry1: (renderer2: GoldenRatio.Renderer) => GoldenRatio.CustomGeometry = function (renderer2: GoldenRatio.Renderer): GoldenRatio.CustomGeometry {
	let geometryVertexArray = new Float32Array([
		// float4 position, float4 color, float2 uv,
		-1, -1, -1, 1, 1, 0, 0, 1, 1, 1, // -> 0
		-1, -1,  1, 1, 0, 1, 0, 1, 0, 1, // -> 1
		 1, -1, -1, 1, 0, 0, 1, 1, 0, 0, // -> 2
	]);

	const customGeom = new GoldenRatio.CustomGeometry(renderer2.device, 1, GoldenRatio.PRIMITIVE_TYPE.TRIANGLE_LIST, false);
	customGeom.allocate(geometryVertexArray);
	return customGeom;
};

let createMultiGeometry: (renderer2: GoldenRatio.Renderer) => GoldenRatio.MultiGeometry = function (renderer2: GoldenRatio.Renderer): GoldenRatio.MultiGeometry {
	let geometryVertexArray = new Float32Array([
		// float4 position, float4 color, float2 uv,
		-1, -1, -1, 1,   1, 0, 1, 1,  1, 1, // -> 0
		-1, -1, 1, 1,  0, 0, 1, 1,  0, 1,   // -> 1
		1, -1, -1, 1, 0, 0, 0, 1,  0, 0,    // -> 2
		1, -1, 1, 1,  1, 0, 0, 1,  1, 0,    // -> 3
		-1, 1, -1, 1,   1, 0, 1, 1,  1, 1,  // -> 4
		-1, 1, 1, 1,  0, 0, 1, 1,  0, 1,    // -> 5
		1, 1, -1, 1, 0, 0, 0, 1,  0, 0,     // -> 6
		1, 1, 1, 1,  1, 0, 0, 1,  1, 0,     // -> 7
	]);

	// For Index its must be a strip
	var geometryIndexArray = new Uint16Array([
		0, 1, 2, 2, 1, 3, 0xFFFF,
		4, 5, 6, 6, 5, 7, 0xFFFF,
		0xFFFF, 0xFFFF,
	 ]);
	const customGeom = new GoldenRatio.MultiGeometry(renderer2.device, GoldenRatio.PRIMITIVE_TYPE.TRIANGLE_STRIP, 8);
	customGeom.drawGeometry(geometryVertexArray, geometryIndexArray);
	return customGeom;
};

let drawCubesMultiGeometry: (renderer2: GoldenRatio.Renderer) => GoldenRatio.MultiGeometry = function (renderer2: GoldenRatio.Renderer): GoldenRatio.MultiGeometry
{
	const customGeom = new GoldenRatio.MultiGeometry(renderer2.device, GoldenRatio.PRIMITIVE_TYPE.TRIANGLE_STRIP, 360*15000);
	let geometryVertexArray = new Float32Array([
		// float4 position, float4 color, float2 uv,
		-1, -1, -1, 1,   1, 0, 1, 1,  1, 1, // -> 0
		-1, -1, 1, 1,  0, 0, 1, 1,  0, 1,   // -> 1
		1, -1, -1, 1, 0, 0, 0, 1,  0, 0,    // -> 2
		1, -1, 1, 1,  1, 0, 0, 1,  1, 0,    // -> 3
		-1, 1, -1, 1,   1, 0, 1, 1,  1, 1,  // -> 4
		-1, 1, 1, 1,  0, 0, 1, 1,  0, 1,    // -> 5
		1, 1, -1, 1, 0, 0, 0, 1,  0, 0,     // -> 6
		1, 1, 1, 1,  1, 0, 0, 1,  1, 0,     // -> 7
	]);

	// For Index its must be a strip
	let geometryIndexArray = new Uint16Array([
		0, 1, 2, 2, 1, 3, 0xFFFF,
		4, 5, 6, 6, 5, 7, 0xFFFF,
		0xFFFF, 0xFFFF,
	]);

	let geometryVertexArray1 = new Float32Array([
		// float4 position, float4 color, float2 uv,
		-1, -1, -1, 1,   1, 0, 1, 1,  1, 1, // -> 0
		-1, -1, 1, 1,  0, 0, 1, 1,  0, 1,   // -> 1
		1, -1, -1, 1, 0, 0, 0, 1,  0, 0,    // -> 2
		1, -1, 1, 1,  1, 0, 0, 1,  1, 0,    // -> 3
	]);

	// For Index its must be a strip
	// let geometryIndexArray1 = new Uint16Array([
	// 	0, 1, 2, 2, 1, 3, 0xFFFF, 0xFFFF,
	// ]);
	let geometryIndexArray1 = new Uint16Array([
		0, 1, 2, 2, 1, 3
	]);

	let geometryVertexArray2 = new Float32Array([
		// float4 position, float4 color, float2 uv,
		-1, 1, -1, 1,   1, 0, 1, 1,  1, 1,  // -> 4
		-1, 1, 1, 1,  0, 0, 1, 1,  0, 1,    // -> 5
		1, 1, -1, 1, 0, 0, 0, 1,  0, 0,     // -> 6
		1, 1, 1, 1,  1, 0, 0, 1,  1, 0,     // -> 7
	]);

	// For Index its must be a strip
	// let geometryIndexArray2 = new Uint16Array([
	// 	4, 5, 6, 6, 5, 7, 0xFFFF, 0xFFFF,
	// ]);
	// let geometryIndexArray2 = new Uint16Array([
	// 	4, 5, 6, 6, 5, 7
	// ]);
	let geometryIndexArray2 = new Uint16Array([
		0, 1, 2, 2, 1, 3
	]);

	// for (let i = 0; i < 5000; i++){
	// 	customGeom.drawGeometry(geometryVertexArray1, geometryIndexArray1);
	// 	customGeom.drawGeometry(geometryVertexArray2, geometryIndexArray2);
	// }

	var delX = 0.0;
	var delY = 0.0;
	// for (let i = 0; i < 5000; i++){	
	// 	let geometryVertexArray5 = new Float32Array([
	// 		// float4 position, float4 color, float2 uv,
	// 		-1 + delX, -1 + delY, -1, 1,   1, 0, 1, 1,  1, 1, // -> 0
	// 		-1 + delX, -1 + delY, 1, 1,  0, 0, 1, 1,  0, 1,   // -> 1
	// 		1 + delX, -1 + delY, -1, 1, 0, 0, 0, 1,  0, 0,    // -> 2
	// 		1 + delX, -1 + delY, 1, 1,  1, 0, 0, 1,  1, 0,    // -> 3
	// 	]);

	// 	let geometryVertexArray6 = new Float32Array([
	// 		// float4 position, float4 color, float2 uv,
	// 		-1 + delX, 1 + delY, -1, 1,   1, 0, 1, 1,  1, 1,  // -> 4
	// 		-1 + delX, 1 + delY, 1, 1,  0, 0, 1, 1,  0, 1,    // -> 5
	// 		1 + delX, 1 + delY, -1, 1, 0, 0, 0, 1,  0, 0,     // -> 6
	// 		1 + delX, 1 + delY, 1, 1,  1, 0, 0, 1,  1, 0,     // -> 7
	// 	]);
		
	// 	customGeom.drawGeometry(geometryVertexArray5, geometryIndexArray1);
	// 	customGeom.drawGeometry(geometryVertexArray6, geometryIndexArray2);

	// 	delX += 0.01;
	// 	delY += 0.01;
	// }
	const cubeIndexArray = new Uint16Array([
		0, 1, 2, 3, 4, 5,
		6, 7, 8, 9, 10, 11,
		12, 13, 14, 15, 16, 17,
		18, 19, 20, 21, 22, 23,
		24, 25, 26, 27, 28, 29,
		30, 31, 32, 33, 34, 35,
	]);
				
	for (let i = 0; i < 15000; i++) {
		let geometryVertexArray7 = new Float32Array([
			// float4 position, float4 color, float2 uv,
			1, -1, 1, 1,   1, 0, 1, 1,  1, 1,
			-1, -1, 1, 1,  0, 0, 1, 1,  0, 1,
			-1, -1, -1, 1, 0, 0, 0, 1,  0, 0,
			1, -1, -1, 1,  1, 0, 0, 1,  1, 0,
			1, -1, 1, 1,   1, 0, 1, 1,  1, 1,
			-1, -1, -1, 1, 0, 0, 0, 1,  0, 0,

			1, 1, 1, 1,    1, 1, 1, 1,  1, 1,
			1, -1, 1, 1,   1, 0, 1, 1,  0, 1,
			1, -1, -1, 1,  1, 0, 0, 1,  0, 0,
			1, 1, -1, 1,   1, 1, 0, 1,  1, 0,
			1, 1, 1, 1,    1, 1, 1, 1,  1, 1,
			1, -1, -1, 1,  1, 0, 0, 1,  0, 0,

			-1, 1, 1, 1,   0, 1, 1, 1,  1, 1,
			1, 1, 1, 1,    1, 1, 1, 1,  0, 1,
			1, 1, -1, 1,   1, 1, 0, 1,  0, 0,
			-1, 1, -1, 1,  0, 1, 0, 1,  1, 0,
			-1, 1, 1, 1,   0, 1, 1, 1,  1, 1,
			1, 1, -1, 1,   1, 1, 0, 1,  0, 0,

			-1, -1, 1, 1,  0, 0, 1, 1,  1, 1,
			-1, 1, 1, 1,   0, 1, 1, 1,  0, 1,
			-1, 1, -1, 1,  0, 1, 0, 1,  0, 0,
			-1, -1, -1, 1, 0, 0, 0, 1,  1, 0,
			-1, -1, 1, 1,  0, 0, 1, 1,  1, 1,
			-1, 1, -1, 1,  0, 1, 0, 1,  0, 0,

			1, 1, 1, 1,    1, 1, 1, 1,  1, 1,
			-1, 1, 1, 1,   0, 1, 1, 1,  0, 1,
			-1, -1, 1, 1,  0, 0, 1, 1,  0, 0,
			-1, -1, 1, 1,  0, 0, 1, 1,  0, 0,
			1, -1, 1, 1,   1, 0, 1, 1,  1, 0,
			1, 1, 1, 1,    1, 1, 1, 1,  1, 1,

			1, -1, -1, 1,  1, 0, 0, 1,  1, 1,
			-1, -1, -1, 1, 0, 0, 0, 1,  0, 1,
			-1, 1, -1, 1,  0, 1, 0, 1,  0, 0,
			1, 1, -1, 1,   1, 1, 0, 1,  1, 0,
			1, -1, -1, 1,  1, 0, 0, 1,  1, 1,
			-1, 1, -1, 1,  0, 1, 0, 1,  0, 0,
		]);
		customGeom.drawGeometry(geometryVertexArray7, cubeIndexArray);

		delX += 0.01;
		delY += 0.01;
	}

	// let geometryVertexArray3 = new Float32Array([
	// 	// float4 position, float4 color, float2 uv,
	// 	-1, -1, -1, 1,   1, 0, 1, 1,  1, 1, // -> 0
	// 	-1, -1, 1, 1,  0, 0, 1, 1,  0, 1,   // -> 1
	// 	1, -1, -1, 1, 0, 0, 0, 1,  0, 0,    // -> 2
	// 	1, -1, 1, 1,  1, 0, 0, 1,  1, 0,    // -> 3
	// ]);

	// let geometryVertexArray4 = new Float32Array([
	// 	// float4 position, float4 color, float2 uv,
	// 	-1, 1, -1, 1,   1, 0, 1, 1,  1, 1,  // -> 4
	// 	-1, 1, 1, 1,  0, 0, 1, 1,  0, 1,    // -> 5
	// 	1, 1, -1, 1, 0, 0, 0, 1,  0, 0,     // -> 6
	// 	1, 1, 1, 1,  1, 0, 0, 1,  1, 0,     // -> 7
	// ]);
	// customGeom.drawGeometryNew(geometryVertexArray3);
	// customGeom.drawGeometryNew(geometryVertexArray4);
	return customGeom;
}

window.onload = function(){
	// [Important] Let the GUI be executed first to create the canvas
	gui.start(binding);

	canvas = document.getElementById('webgpu-canvas') as HTMLCanvasElement;
	const renderer = new GoldenRatio.Renderer(canvas, binding, 0);

	renderer.initializeAPI().then((success) => {
		if (!success) return;

		const scene = new GoldenRatio.Scene();
		scene.add(new GoldenRatio.Particles(renderer.device, renderer.primitive, renderer.binding, GoldenRatio.PRIMITIVE_TYPE.POINT_LIST));
	
		// Camera
		camera = new GoldenRatio.Camera(canvas.width/ canvas.height);
        camera.z = 2;

		const doFrame = () => {
			renderer.render(scene, camera);
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
	/////////////////////////////////////////////////////////////////
	
	canvas2 = document.getElementById('webgpu-canvas2') as HTMLCanvasElement;
	const renderer2 = new GoldenRatio.Renderer(canvas2, binding, 1);
	renderer2.initializeAPI().then((success) => {
		if (!success) return;

		const scene2 = new GoldenRatio.Scene();
		// for (let i = 0; i < 5000; i++)
		// scene2.add(createCustomGeometry(renderer2));

		// for (let i = 0; i < 5000; i++) {
		//     scene2.add(discreteCubeGeometry(renderer2));
		// }
		
//		scene2.add(createMultiGeometry(renderer2));
//		scene2.add(createMultiGeometry(renderer2));

		const shapetest = new ShapeTest;
		const customGeom = new GoldenRatio.MultiGeometry(renderer2.device, GoldenRatio.PRIMITIVE_TYPE.TRIANGLE_STRIP, 360*10000);
        scene2.add(customGeom);

		// Camera
		camera2 = new GoldenRatio.Camera(canvas.width/ canvas.height);
        camera2.z = 12;
	
		const doFrame2 = () => {
			shapetest.updateCubesMultiGeometry(customGeom);
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

