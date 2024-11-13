export type Shader = {
    id: number;
    name: string;
    shader: (ctx: CanvasRenderingContext2D, time: number) => void;
  };
  
  export const shaders: Shader[] = [
    { 
      id: 1, 
      name: 'Ripple Effect', 
      shader: (ctx: CanvasRenderingContext2D, time: number) => {
        const { width, height } = ctx.canvas;
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const dx = x - width / 2;
            const dy = y - height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const intensity = Math.sin(distance * 0.1 - time * 5) * 127 + 128;
            ctx.fillStyle = `rgb(${intensity}, ${intensity}, 255)`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    { 
      id: 2, 
      name: 'Plasma Wave', 
      shader: (ctx: CanvasRenderingContext2D, time: number) => {
        const { width, height } = ctx.canvas;
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const value = Math.sin(x * 0.01 + time) + Math.sin(y * 0.01 + time);
            const r = Math.sin(value * Math.PI) * 127 + 128;
            const g = Math.sin(value * Math.PI + 2 * Math.PI / 3) * 127 + 128;
            const b = Math.sin(value * Math.PI + 4 * Math.PI / 3) * 127 + 128;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    { 
      id: 3, 
      name: 'Fractal Noise', 
      shader: (ctx: CanvasRenderingContext2D, time: number) => {
        const { width, height } = ctx.canvas;
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const value = (Math.sin(x * 0.01) + Math.sin(y * 0.01) + Math.sin(time)) * 0.33;
            const intensity = (value + 1) * 127.5;
            ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
  ];