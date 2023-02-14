import Core from './Core';
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="canvas" width="400" height="400"></canvas>
`

const data = [
  {
    name: 'sun',
    vertices: [
      -0.5, -0.5,
      -0.5, 0.5,
      0.5, 0.5,
      0.5, -0.5
    ],
    indices: [0, 1, 1, 2, 2, 3, 3, 0],
    translation: { x: 0, y: 0 },
    rotationZ: 0,
    scaleXY: 0.3,
    children: [
      {
        name: 'earth',
        vertices: [
          -0.5, -0.5,
          -0.5, 0.5,
          0.5, 0.5,
          0.5, -0.5
        ],
        indices: [0, 1, 1, 2, 2, 3, 3, 0],
        translation: { x: -0.7, y: 0 },
        rotationZ: 0,
        scaleXY: 0.1,
        children: [
          {
            name: 'moon',
            vertices: [
              -0.5, -0.5,
              -0.5, 0.5,
              0.5, 0.5,
              0.5, -0.5
            ],
            indices: [0, 1, 1, 2, 2, 3, 3, 0],
            translation: { x: -0.2, y: 0 },
            rotationZ: 0,
            scaleXY: 0.05,
          },
        ]
      },
    ]
  },


]
new Core(document.querySelector<HTMLCanvasElement>('#canvas')!, data);
