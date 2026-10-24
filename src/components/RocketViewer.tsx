"use client";
import { useEffect, useRef, useState } from "react";
import { Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
export default function RocketViewer({
  slug,
  name,
  focus = "all",
}: {
  slug: string;
  name: string;
  focus?: string;
}) {
  const host = useRef<HTMLDivElement>(null),
    control = useRef<OrbitControls | null>(null);
  const [state, setState] = useState("loading"),
    [paused, setPaused] = useState(false);
  const focusRef = useRef(focus);
  useEffect(() => {
    focusRef.current = focus;
    const controls = control.current;
    if (controls) {
      controls.autoRotate = false;
      setPaused(true);
      controls.target.set(
        0,
        focus === "payload" ? 1.5 : focus === "engines" ? -1.7 : 0,
        0
      );
      controls.object.position.set(
        0,
        focus === "payload" ? 1.5 : focus === "engines" ? -1.7 : 0,
        focus === "all" ? 8.5 : 5
      );
      controls.update();
    }
  }, [focus]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setState("unavailable");
      return;
    }
    setState("loading");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 8.5);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    element.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    control.current = controls;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = true;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const initialFocus = focusRef.current;
    const focusY =
      initialFocus === "payload" ? 1.5 : initialFocus === "engines" ? -1.7 : 0;
    controls.target.set(0, focusY, 0);
    camera.position.set(0, focusY, initialFocus === "all" ? 8.5 : 5);
    controls.autoRotate = !motion.matches && initialFocus === "all";
    setPaused(!controls.autoRotate);
    controls.autoRotateSpeed = 0.8;
    scene.add(new THREE.HemisphereLight(0xd9f1ff, 0x263842, 3));
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-3, 4, 5);
    scene.add(light);
    const rim = new THREE.DirectionalLight(0x74d7ee, 2);
    rim.position.set(3, 0, -3);
    scene.add(rim);
    let disposed = false;
    const release = (object: THREE.Object3D) =>
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          for (const material of Array.isArray(child.material)
            ? child.material
            : [child.material]) {
            for (const value of Object.values(material))
              if (value instanceof THREE.Texture) value.dispose();
            material.dispose();
          }
        }
      });
    const draco = new DRACOLoader().setDecoderPath("/draco/").setWorkerLimit(1);
    new GLTFLoader().setDRACOLoader(draco).load(
      `/models/${slug}.glb`,
      (gltf) => {
        if (disposed) {
          release(gltf.scene);
          return;
        }
        const model = gltf.scene;
        model.updateMatrixWorld(true);
        let box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        if (size.z > size.y && size.z > size.x) model.rotation.x = -Math.PI / 2;
        else if (size.x > size.y) model.rotation.z = Math.PI / 2;
        model.updateMatrixWorld(true);
        box = new THREE.Box3().setFromObject(model);
        const height = box.getSize(new THREE.Vector3()).y;
        model.scale.setScalar(4.5 / height);
        model.updateMatrixWorld(true);
        box = new THREE.Box3().setFromObject(model);
        model.position.sub(box.getCenter(new THREE.Vector3()));
        scene.add(model);
        setState("ready");
      },
      undefined,
      () => {
        if (!disposed) setState("unavailable");
      }
    );
    const resize = () => {
      const width = element.clientWidth,
        height = element.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    resize();
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(element);
    const motionChange = () => {
      controls.autoRotate = !motion.matches;
      setPaused(motion.matches);
    };
    motion.addEventListener("change", motionChange);
    const lost = (event: Event) => {
      event.preventDefault();
      setState("unavailable");
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      if (visible && !document.hidden) {
        controls.update(delta);
        renderer.render(scene, camera);
      }
    };
    animate();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
      motion.removeEventListener("change", motionChange);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      controls.dispose();
      draco.dispose();
      control.current = null;
      release(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [slug]);
  const zoom = (factor: number) => {
    const controls = control.current;
    if (!controls) return;
    const vector = controls.object.position
      .clone()
      .sub(controls.target)
      .multiplyScalar(factor)
      .clampLength(3, 12);
    controls.object.position.copy(controls.target).add(vector);
    controls.update();
  };
  return (
    <div className="heritage-viewer">
      <div
        ref={host}
        className="heritage-canvas"
        role="img"
        aria-label={`${name} NASA 3D model. Use the buttons to rotate, zoom, or focus on components.`}
      />
      {state !== "ready" && (
        <div className="model-poster">
          <img src={`/models/${slug}.png`} alt={`${name} NASA model preview`} />
          <span>
            {state === "loading"
              ? "Preparing 3D model…"
              : "Static preview · 3D unavailable on this device"}
          </span>
        </div>
      )}
      <div className="viewer-coordinate">
        NASA 3D RESOURCES / {name.toUpperCase()}
      </div>
      <div className="viewer-buttons">
        <button
          aria-label="Rotate model left"
          onClick={() => {
            const c = control.current;
            if (c) {
              c.autoRotate = false;
              setPaused(true);
              const direction = c.object.position
                .clone()
                .sub(c.target)
                .applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.35);
              c.object.position.copy(c.target).add(direction);
              c.update();
            }
          }}
        >
          <RotateCcw size={15} />
        </button>
        <button
          aria-label={paused ? "Start model rotation" : "Pause model rotation"}
          onClick={() => {
            if (control.current) {
              control.current.autoRotate = paused;
              setPaused(!paused);
            }
          }}
        >
          {paused ? <Play size={15} /> : <Pause size={15} />}
        </button>
        <button aria-label="Zoom model out" onClick={() => zoom(1.15)}>
          <Minus size={15} />
        </button>
        <button aria-label="Zoom model in" onClick={() => zoom(0.85)}>
          <Plus size={15} />
        </button>
        <button
          onClick={() => {
            const c = control.current;
            if (c) {
              c.target.set(0, 0, 0);
              c.object.position.set(0, 0, 8.5);
              c.update();
            }
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
