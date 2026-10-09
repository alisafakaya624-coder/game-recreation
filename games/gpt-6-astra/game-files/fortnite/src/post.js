import * as T from '../vendor/three.module.js';

// A small depth-aware ambient-occlusion pass supplies contact shading to the authored assets.
// All buffers remain local to the renderer and resize with the drawing surface.
export function createPost(renderer,scene,camera){
 const target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,minFilter:T.LinearFilter,magFilter:T.LinearFilter});
 target.samples=4;target.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);
 const uniforms={colorTexture:{value:target.texture},depthTexture:{value:target.depthTexture},inverseProjection:{value:camera.projectionMatrixInverse},resolution:{value:new T.Vector2(1,1)}};
 const mat=new T.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,toneMapped:true,
  vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`varying vec2 vUv;
  uniform sampler2D colorTexture;
  uniform sampler2D depthTexture;
  uniform mat4 inverseProjection;
  uniform vec2 resolution;
  vec3 pointAt(vec2 uv){float z=texture2D(depthTexture,uv).x;vec4 p=inverseProjection*vec4(uv*2.-1.,z*2.-1.,1.);return p.xyz/p.w;}
  void main(){
   vec3 color=texture2D(colorTexture,vUv).rgb;
   float depth=texture2D(depthTexture,vUv).x;
   if(depth<.9999){
    vec3 p=pointAt(vUv),n=normalize(cross(dFdx(p),dFdy(p)));
    float radius=clamp(23./max(1.,-p.z),1.,16.);
    float occ=0.;
    for(int i=0;i<12;i++){
     float a=float(i)*2.3999632;
     float r=(.45+float(i)/12.)*radius;
     vec2 uv=vUv+vec2(cos(a),sin(a))*r/resolution;
     vec3 delta=pointAt(uv)-p;float d=length(delta);
     occ+=max(0.,dot(n,delta/max(.001,d))-.12)*(1.-smoothstep(.15,2.1,d));
    }
    color*=1.-min(.38,occ*.14);
   }
   float luma=dot(color,vec3(.2126,.7152,.0722));
   color=mix(vec3(luma),color,1.055);
   gl_FragColor=vec4(color,1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`});
 const quad=new T.Mesh(new T.PlaneGeometry(2,2),mat),screen=new T.Scene();screen.add(quad);const screenCamera=new T.Camera(),size=new T.Vector2();let width=0,height=0;
 renderer.info.autoReset=false;
 return ()=>{
  renderer.info.reset();
  if(!renderer.shadowMap.enabled){renderer.render(scene,camera);return;}
  renderer.getDrawingBufferSize(size);if(width!==size.x||height!==size.y){width=size.x;height=size.y;target.setSize(width,height);uniforms.resolution.value.copy(size);}
  renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(screen,screenCamera);
 };
}
