/// <reference types="@webgpu/types" />

async function initWebGPU() {
  const canvas = document.getElementById("gpu-canvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Canvas element not found or invalid");
}

  const context = canvas.getContext("webgpu") as GPUCanvasContext;

  const adapter = await navigator.gpu?.requestAdapter();
if (!adapter) throw new Error("No appropriate GPUAdapter found.");

const device = await adapter.requestDevice();
if (!device) throw new Error("Failed to get GPUDevice.");

  if (!device) throw new Error("WebGPU not supported");

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "opaque" });

  // Triangle vertex data: x, y
  const vertices = new Float32Array([
     0.0,  0.5,
    -0.5, -0.5,
     0.5, -0.5,
  ]);
  document.addEventListener("DOMContentLoaded", () => {
  initWebGPU().catch(console.error);
});


  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });

  device.queue.writeBuffer(vertexBuffer, 0, vertices);

  const shaderCode = `
    @vertex
    fn vs_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
      return vec4<f32>(position, 0.0, 1.0);
    }

    @fragment
    fn fs_main() -> @location(0) vec4<f32> {
      return vec4<f32>(1.0, 0.0, 0.0, 1.0); // red
    }
  `;

  const shaderModule = device.createShaderModule({ code: shaderCode });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vs_main",
      buffers: [{
        arrayStride: 8,
        attributes: [{ shaderLocation: 0, offset: 0, format: "float32x2" }]
      }]
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fs_main",
      targets: [{ format }]
    },
    primitive: {
      topology: "triangle-list"
    }
  });

  const colorAttachment: GPURenderPassColorAttachment = {
    view: {} as GPUTextureView,
    clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
    loadOp: "clear",
    storeOp: "store"
  };

  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [colorAttachment]
  };

  function frame() {
    colorAttachment.view = context.getCurrentTexture().createView();

    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.draw(3);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

initWebGPU().catch(console.error);
