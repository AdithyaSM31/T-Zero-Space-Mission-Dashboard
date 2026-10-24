"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Props = {
  mode?: "earth" | "rocket";
  latitude?: number;
  longitude?: number;
};
export default function SpaceScene({
  mode = "earth",
  latitude,
  longitude,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const coordinate = useRef({ latitude, longitude });
  useEffect(() => {
    coordinate.current = { latitude, longitude };
  }, [latitude, longitude]);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setUnavailable(true);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(
      0,
      mode === "rocket" ? 0.5 : 0.3,
      mode === "rocket" ? 8.5 : 6.8
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    element.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.autoRotate = !reduced.matches;
    controls.autoRotateSpeed = mode === "rocket" ? 0.7 : 0.22;
    controls.minDistance = mode === "rocket" ? 5 : 4.2;
    controls.maxDistance = mode === "rocket" ? 12 : 9;
    scene.add(new THREE.AmbientLight(0x8bb5df, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.position.set(-3, 3, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x39bfff, 2);
    rim.position.set(4, 0, -2);
    scene.add(rim);
    const group = new THREE.Group();
    scene.add(group);
    let texture: THREE.Texture | undefined;
    let marker: THREE.Mesh | undefined;
    if (mode === "earth") {
      texture = new THREE.TextureLoader().load("/textures/earth.jpg");
      texture.colorSpace = THREE.SRGBColorSpace;
      const earth = new THREE.Mesh(
        new THREE.SphereGeometry(1.85, 64, 48),
        new THREE.MeshPhongMaterial({
          map: texture,
          color: 0xa6cbe3,
          shininess: 12,
          specular: 0x294f6c,
        })
      );
      group.add(earth);
      // Rotate the selected surface coordinate toward the camera; markers share this transform.
      group.rotation.y = -1.2;
      group.rotation.x = 0.15;
      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.89, 64, 48),
        new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.BackSide,
          depthWrite: false,
          vertexShader: `varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
          fragmentShader: `varying vec3 n; varying vec3 v; void main(){float r=pow(1.0-abs(dot(normalize(n),normalize(v))),3.0);gl_FragColor=vec4(0.12,0.57,1.0,r*0.65);}`,
        })
      );
      scene.add(atmosphere);
      marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xa8ffdf })
      );
      marker.visible = false;
      group.add(marker);
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.003, 8, 160),
        new THREE.MeshBasicMaterial({
          color: 0x5ca5bc,
          transparent: true,
          opacity: 0.28,
        })
      );
      orbit.rotation.set(1.12, 0.3, -0.4);
      scene.add(orbit);
    } else {
      const white = new THREE.MeshStandardMaterial({
        color: 0xdde6ed,
        metalness: 0.4,
        roughness: 0.35,
      });
      const dark = new THREE.MeshStandardMaterial({
        color: 0x172431,
        metalness: 0.7,
        roughness: 0.3,
      });
      const part = (
        geometry: THREE.BufferGeometry,
        material: THREE.Material,
        y: number
      ) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = y;
        group.add(mesh);
        return mesh;
      };
      part(new THREE.CylinderGeometry(0.23, 0.23, 2.7, 40), white, -0.4);
      part(new THREE.CylinderGeometry(0.24, 0.24, 0.23, 40), dark, 0.64);
      part(new THREE.CylinderGeometry(0.3, 0.23, 0.35, 40), white, 1.08);
      part(new THREE.CylinderGeometry(0.3, 0.3, 0.65, 40), white, 1.58);
      part(new THREE.ConeGeometry(0.3, 0.65, 40), white, 2.23);
      for (let i = 0; i < 5; i++) {
        const engine = part(
          new THREE.CylinderGeometry(0.05, 0.09, 0.2, 20),
          dark,
          -1.85
        );
        engine.position.x = Math.cos((i * Math.PI * 2) / 5) * 0.13;
        engine.position.z = Math.sin((i * Math.PI * 2) / 5) * 0.13;
      }
      for (let i = 0; i < 4; i++) {
        const fin = part(new THREE.BoxGeometry(0.025, 0.3, 0.4), dark, -1.45);
        fin.rotation.y = (i * Math.PI) / 2;
        fin.position.x = Math.sin((i * Math.PI) / 2) * 0.25;
        fin.position.z = Math.cos((i * Math.PI) / 2) * 0.25;
      }
      group.rotation.z = -0.12;
    }
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    let visible = true;
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersection.observe(element);
    const motionChange = () => {
      controls.autoRotate = !reduced.matches;
    };
    reduced.addEventListener("change", motionChange);
    let frame = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      if (visible && !document.hidden) {
        const { latitude: lat, longitude: lon } = coordinate.current;
        if (mode === "earth" && marker) {
          marker.visible = lat !== undefined && lon !== undefined;
          if (lat !== undefined && lon !== undefined) {
            const phi = THREE.MathUtils.degToRad(90 - lat);
            const theta = THREE.MathUtils.degToRad(lon + 180);
            marker.position.set(
              -1.87 * Math.sin(phi) * Math.cos(theta),
              1.87 * Math.cos(phi),
              1.87 * Math.sin(phi) * Math.sin(theta)
            );
            const amount = reduced.matches ? 1 : 1 - Math.exp(-delta * 5);
            group.rotation.y = THREE.MathUtils.lerp(
              group.rotation.y,
              -THREE.MathUtils.degToRad(lon) - Math.PI / 2,
              amount
            );
            group.rotation.x = THREE.MathUtils.lerp(
              group.rotation.x,
              THREE.MathUtils.degToRad(lat),
              amount
            );
          }
        }
        controls.update(delta);
        renderer.render(scene, camera);
      }
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      reduced.removeEventListener("change", motionChange);
      controls.dispose();
      controlsRef.current = null;
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      texture?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [mode]);
  return (
    <div className={`space-scene ${mode}`}>
      <div
        ref={host}
        className="scene-canvas"
        role="img"
        aria-label={
          mode === "earth"
            ? "Interactive three-dimensional Earth. Drag to rotate, or use the rotation buttons."
            : "Illustrative three-dimensional launch vehicle. Drag to rotate."
        }
      />
      {unavailable && (
        <div className="scene-fallback">
          {mode === "earth" ? (
            <div className="fallback-earth" />
          ) : (
            <p>3D preview unavailable on this device.</p>
          )}
        </div>
      )}
      <div className="scene-controls">
        <button
          aria-label="Rotate left"
          onClick={() => {
            const c = controlsRef.current;
            if (c) {
              c.autoRotate = false;
              c.object.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.3);
              c.update();
            }
          }}
        >
          <RotateCcw size={15} />
        </button>
        <span />
        <button
          aria-label="Zoom out"
          onClick={() => {
            const c = controlsRef.current;
            if (c) {
              c.object.position
                .multiplyScalar(1.12)
                .clampLength(c.minDistance, c.maxDistance);
              c.update();
            }
          }}
        >
          <Minus size={15} />
        </button>
        <button
          aria-label="Zoom in"
          onClick={() => {
            const c = controlsRef.current;
            if (c) {
              c.object.position
                .multiplyScalar(0.88)
                .clampLength(c.minDistance, c.maxDistance);
              c.update();
            }
          }}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
