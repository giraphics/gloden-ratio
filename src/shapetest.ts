import * as GoldenRatio from "./renderer/index";

export default class ShapeTest {
	public drawCubev36(customGeom: GoldenRatio.MultiGeometry, geometryCount: number)
	{
		// 1100 @30FPS
		const cubeIndexArray = new Uint16Array([
			0, 1, 2, 3, 4, 5,
			6, 7, 8, 9, 10, 11,
			12, 13, 14, 15, 16, 17,
			18, 19, 20, 21, 22, 23,
			24, 25, 26, 27, 28, 29,
			30, 31, 32, 33, 34, 35,
		]);
					
		var delX = 0.0;
		var delY = 0.0;

		for (let i = 0; i < geometryCount; i++) {
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
	}

	public drawCubev8 (customGeom: GoldenRatio.MultiGeometry, geometryCount: number)
	{
		// 5000 @30FPS
		const cubeIndexArray = new Uint16Array([
			0,3,1, 3,2,1,
			7,4,6, 4,5,6,
			4,0,5, 0,1,5,
			3,7,2, 7,6,2,
			1,2,5, 2,6,5,
			3,0,7, 0,4,7,
		]);
					
		var delX = 0.0;
		var delY = 0.0;
		
		for (let i = 0; i < geometryCount; i++) {
			let geometryVertexArray7 = new Float32Array([
				// float4 position, float4 color, float2 uv,
				-1, -1, 1, 1,   1, 0, 1, 1,  1, 1,
				-1,  1, 1, 1,  0, 0, 1, 1,  0, 1,
				1,  1, 1, 1,  0, 1, 0, 1,  0, 1,
				1, -1, 1, 1, 1, 0, 0, 1,  0, 0,

				-1, -1, -1, 1,  1, 1, 0, 1,  1, 0,
				-1, 1, -1, 1,   1, 1, 1, 1,  1, 1,
				1, 1, -1, 1, 0, 1, 1, 1,  0, 0,
				1, -1, -1, 1, 1, 0, 1, 1,  0, 0,
			]);

			customGeom.drawGeometry(geometryVertexArray7, cubeIndexArray);
	
			delX += 0.01;
			delY += 0.01;
		}
	}

	public drawCubev8Line (customGeom: GoldenRatio.MultiGeometry, geometryCount: number)
	{
		// 5000 @30FPS
		const cubeIndexArray = new Uint16Array([
			0,3,1, 3,2,1,
			7,4,6, 4,5,6,
			4,0,5, 0,1,5,
			3,7,2, 7,6,2,
			1,2,5, 2,6,5,
			3,0,7, 0,4,7,
		]);
					
		var delX = 0.0;
		var delY = 0.0;
		
		for (let i = 0; i < geometryCount; i++) {
			let geometryVertexArray7 = new Float32Array([
				// float4 position, float4 color, float2 uv,
				-1, -1, 1, 1,   1, 0, 1, 1,  1, 1,
				-1,  1, 1, 1,  0, 0, 1, 1,  0, 1,
				1,  1, 1, 1,  0, 1, 0, 1,  0, 1,
				1, -1, 1, 1, 1, 0, 0, 1,  0, 0,

				-1, -1, -1, 1,  1, 1, 0, 1,  1, 0,
				-1, 1, -1, 1,   1, 1, 1, 1,  1, 1,
				1, 1, -1, 1, 0, 1, 1, 1,  0, 0,
				1, -1, -1, 1, 1, 0, 1, 1,  0, 0,
			]);

			customGeom.drawGeometry(geometryVertexArray7, cubeIndexArray);
	
			delX += 0.01;
			delY += 0.01;
		}
	}

public drawCubesMultiGeometry2: (renderer2: GoldenRatio.Renderer) => GoldenRatio.MultiGeometry = function (renderer2: GoldenRatio.Renderer): GoldenRatio.MultiGeometry
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

}