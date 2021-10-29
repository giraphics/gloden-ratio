import * as GoldenRatio from "./renderer/index";

export default class ShapeTest {
	public drawCubev36(customGeom: GoldenRatio.MultiGeometry, geometryCount: number, step: number)
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
				1 + delX, -1 + delY, 1, 1,   1, 0, 1, 1,  1, 1,
				-1 + delX, -1 + delY, 1, 1,  0, 0, 1, 1,  0, 1,
				-1 + delX, -1 + delY, -1, 1, 0, 0, 0, 1,  0, 0,
				1 + delX, -1 + delY, -1, 1,  1, 0, 0, 1,  1, 0,
				1 + delX, -1 + delY, 1, 1,   1, 0, 1, 1,  1, 1,
				-1 + delX, -1 + delY, -1, 1, 0, 0, 0, 1,  0, 0,
	
				1 + delX, 1 + delY, 1, 1,    1, 1, 1, 1,  1, 1,
				1 + delX, -1 + delY, 1, 1,   1, 0, 1, 1,  0, 1,
				1 + delX, -1 + delY, -1, 1,  1, 0, 0, 1,  0, 0,
				1 + delX, 1 + delY, -1, 1,   1, 1, 0, 1,  1, 0,
				1 + delX, 1 + delY, 1, 1,    1, 1, 1, 1,  1, 1,
				1 + delX, -1 + delY, -1, 1,  1, 0, 0, 1,  0, 0,
	
				-1 + delX, 1 + delY, 1, 1,   0, 1, 1, 1,  1, 1,
				1 + delX, 1 + delY, 1, 1,    1, 1, 1, 1,  0, 1,
				1 + delX, 1 + delY, -1, 1,   1, 1, 0, 1,  0, 0,
				-1 + delX, 1 + delY, -1, 1,  0, 1, 0, 1,  1, 0,
				-1 + delX, 1 + delY, 1, 1,   0, 1, 1, 1,  1, 1,
				1 + delX, 1 + delY, -1, 1,   1, 1, 0, 1,  0, 0,
	
				-1 + delX, -1 + delY, 1, 1,  0, 0, 1, 1,  1, 1,
				-1 + delX, 1 + delY, 1, 1,   0, 1, 1, 1,  0, 1,
				-1 + delX, 1 + delY, -1, 1,  0, 1, 0, 1,  0, 0,
				-1 + delX, -1 + delY, -1, 1, 0, 0, 0, 1,  1, 0,
				-1 + delX, -1 + delY, 1, 1,  0, 0, 1, 1,  1, 1,
				-1 + delX, 1 + delY, -1, 1,  0, 1, 0, 1,  0, 0,
	
				1 + delX, 1 + delY, 1, 1,    1, 1, 1, 1,  1, 1,
				-1 + delX, 1 + delY, 1, 1,   0, 1, 1, 1,  0, 1,
				-1 + delX, -1 + delY, 1, 1,  0, 0, 1, 1,  0, 0,
				-1 + delX, -1 + delY, 1, 1,  0, 0, 1, 1,  0, 0,
				1 + delX, -1 + delY, 1, 1,   1, 0, 1, 1,  1, 0,
				1 + delX, 1 + delY, 1, 1,    1, 1, 1, 1,  1, 1,
	
				1 + delX, -1 + delY, -1, 1,  1, 0, 0, 1,  1, 1,
				-1 + delX, -1 + delY, -1, 1, 0, 0, 0, 1,  0, 1,
				-1 + delX, 1 + delY, -1, 1,  0, 1, 0, 1,  0, 0,
				1 + delX, 1 + delY, -1, 1,   1, 1, 0, 1,  1, 0,
				1 + delX, -1 + delY, -1, 1,  1, 0, 0, 1,  1, 1,
				-1 + delX, 1 + delY, -1, 1,  0, 1, 0, 1,  0, 0,
			]);
			customGeom.drawGeometry(geometryVertexArray7, cubeIndexArray);
	
			delX += step;
			delY += step;
		}
	}

	public drawCubev8TriangleList (customGeom: GoldenRatio.MultiGeometry, geometryCount: number, step: number)
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
				-1 + delX, -1 + delY, 1, 1,   1, 0, 1, .5,  1, 1,
				-1 + delX,  1 + delY, 1, 1,  0, 0, 1, .5,  0, 1,
				1 + delX,  1 + delY, 1, 1,  0, 1, 0, .5,  0, 1,
				1 + delX, -1 + delY, 1, 1, 1, 0, 0, .5,  0, 0,

				-1 + delX, -1 + delY, -1, 1,  1, 1, 0, .5,  1, 0,
				-1 + delX, 1 + delY, -1, 1,   1, 1, 1, .5,  1, 1,
				1 + delX, 1 + delY, -1, 1, 0, 1, 1, .5,  0, 0,
				1 + delX, -1 + delY, -1, 1, 1, 0, 1, .5,  0, 0,
			]);

			customGeom.drawGeometry(geometryVertexArray7, cubeIndexArray);
	
			delX += step;
			delY += step;
		}
	}

	public drawCubev8Line (customGeom: GoldenRatio.MultiGeometry, geometryCount: number, step: number)
	{
		// 5000 @30FPS
		const cubeIndexArray = new Uint16Array([
			0, 1,
			1, 2,
			2, 3,
			3, 0,

			4, 5,
			5, 6,
			6, 7,
			7, 4,

			0, 4,
			1, 5,
			2, 6,
			3, 7,
		]);
					
		var delX = 0.0;
		var delY = 0.0;
		
		for (let i = 0; i < geometryCount; i++) {
			let geometryVertexArray7 = new Float32Array([
				// float4 position, float4 color, float2 uv,
				-1 + delX, -1 + delY, 1, 1, 1, 0, 1, 1, 1, 1,
				-1 + delX,  1 + delY, 1, 1, 0, 0, 1, 1, 0, 1,
				1 + delX,  1 + delY, 1, 1, 0, 1, 0, 1, 0, 1,
				1 + delX, -1 + delY, 1, 1, 1, 0, 0, 1, 0, 0,

				-1 + delX, -1 + delY, -1, 1, 1, 1, 0, 1, 1, 0,
				-1 + delX, 1 + delY, -1, 1, 1, 1, 1, 1, 1, 1,
				1 + delX, 1 + delY, -1, 1, 0, 1, 1, 1, 0, 0,
				1 + delX, -1 + delY, -1, 1, 1, 0, 1, 1, 0, 0,
			]);

			customGeom.drawGeometry(geometryVertexArray7, cubeIndexArray);
	
			delX += step;
			delY += step;
		}
	}

	public drawGrid(customGeom: GoldenRatio.MultiGeometry, geometryCount: number)
	{
		let size = 50;
 		let halfSize = 50 / 2;
 		let divisions = 50;
 		let step = 1;

		let interleaveData = [];
		let idxData = [];
		 step = size / divisions;
		 halfSize = size / 2;
		 for (let i = 0, k = -halfSize; i <= divisions; i++ , k += step) {
		   interleaveData.push(
			 -halfSize, 0, k, 1, 1, 1, 1, 1, 1, 1,
			 halfSize, 0, k, 1, 1, 1, 1, 1, 1, 1,
			 k, 0, -halfSize, 1, 1, 1, 1, 1, 1, 1,
			 k, 0, halfSize, 1, 1, 1, 1, 1, 1, 1,
		   );

		   idxData.push(0 + i * 4, 1 + i * 4, 2 + i * 4, 3 + i * 4);
		}

		let vertexGrid = new Float32Array(interleaveData);
		let idxGrid = new Uint16Array(idxData);
							 
		for (let i = 0; i < geometryCount; i++) {
			customGeom.drawGeometry(vertexGrid, idxGrid);
		}
	}
}