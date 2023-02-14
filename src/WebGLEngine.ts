import { mat4 } from 'gl-matrix'
import { Object3D } from './Core';
const FS_SHADER = `void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}`
const VS_SHADER = `attribute vec2 aVertexPosition;
uniform mat4 uMVMatrix;
void main(void) {
  gl_Position = uMVMatrix * vec4(aVertexPosition, 0.0, 1.0);
}`


export default class WebGL {
  private readonly gl: WebGLRenderingContext;
  private shaderProgram: WebGLProgram | null = null;
  private vertexPositionAttribute: number | null = null;
  private uMVMatrix: WebGLUniformLocation | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  
  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl')!;
    // установка шейдеров 
    this.initShaders();
    // Создание буферов
    this.initBuffers()
  }

  drawFigure(data: Object3D) {
    this.gl.uniformMatrix4fv(this.uMVMatrix, false, data.mvMatrix);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data.vertices), this.gl.STATIC_DRAW);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), this.gl.STATIC_DRAW)
    // указываем, что каждая вершина имеет по 2 координаты (x, y)
    this.gl.vertexAttribPointer(this.vertexPositionAttribute!, 2, this.gl.FLOAT, false, 0, 0);
    // отрисовка примитивов - линий          
    this.gl.drawElements(this.gl.LINES, data.indices.length, this.gl.UNSIGNED_SHORT, 0);
  }

  private initShaders() {
    // получаем шейдеры
    const fragmentShader = this.getShader(FS_SHADER, this.gl.FRAGMENT_SHADER)!;
    const vertexShader = this.getShader(VS_SHADER, this.gl.VERTEX_SHADER)!;
    //создаем объект программы шейдеров
    this.shaderProgram = this.gl.createProgram()!;
    // прикрепляем к ней шейдеры
    this.gl.attachShader(this.shaderProgram, vertexShader);
    this.gl.attachShader(this.shaderProgram, fragmentShader);
    // связываем программу с контекстом webgl
    this.gl.linkProgram(this.shaderProgram);

    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
      alert("Не удалсь установить шейдеры");
    }

    this.gl.useProgram(this.shaderProgram);
    // установка атрибута программы
    this.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    // подключаем атрибут для использования
    this.gl.enableVertexAttribArray(this.vertexPositionAttribute);

    // создания переменных uniform для передачи матриц в шейдер
    this.uMVMatrix = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
    // this.ProjMatrix = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
  }

  private getShader(shaderSrc: string, type: number) {
    // создаем шейдер по типу
    const shader = this.gl.createShader(type);
    // установка источника шейдера
    this.gl.shaderSource(shader!, shaderSrc);
    // компилируем шейдер
    this.gl.compileShader(shader!);

    if (!this.gl.getShaderParameter(shader!, this.gl.COMPILE_STATUS)) {
      alert("Ошибка компиляции шейдера: " + this.gl.getShaderInfoLog(shader!));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private initBuffers() {
    // установка буфера вершин
    this.vertexBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    
    this.indexBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

  refreshGL() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    // установка области отрисовки
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }
}
