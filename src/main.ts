/// <reference types="@webgpu/types" />
async function initWebGPU() {
    if (!navigator.gpu) {
      throw new Error("WebGPU is not supported on this browser.");
    }
  
   /// <reference types="@webgpu/types" />

// ...

const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;
const context = canvas.getContext("webgpu") as GPUCanvasContext;

const adapter = await navigator.gpu.requestAdapter();
if (!adapter) throw new Error("No GPU adapter found.");
const device = await adapter.requestDevice();

const format = navigator.gpu.getPreferredCanvasFormat();

context.configure({
  device,
  format,
  alphaMode: "opaque"
});


const colorAttachment: GPURenderPassColorAttachment = {
  view: {} as GPUTextureView, // placeholder, gets set each frame
  clearValue: { r: 0.1, g: 0.2, b: 0.3, a: 1 },
  loadOp: "clear",
  storeOp: "store"
};

const renderPassDescriptor: GPURenderPassDescriptor = {
  colorAttachments: [colorAttachment] 
};

function frame() {
  colorAttachment.view = context.getCurrentTexture().createView(); 

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass(renderPassDescriptor);
  pass.end();
  device.queue.submit([encoder.finish()]);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

  }
  
  initWebGPU().catch(err => console.error(err));
  
