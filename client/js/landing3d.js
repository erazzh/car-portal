import * as THREE from "https://unpkg.com/three@0.159.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.159.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.159.0/examples/jsm/loaders/GLTFLoader.js";

const container = document.getElementById("scene");

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(2.8, 1.2, 4.2);

// lights
const ambient = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(4, 6, 3);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(-6, 3, -4);
scene.add(rimLight);

// floor (subtle)
const floorGeo = new THREE.CircleGeometry(6, 64);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x0b0f17,
  roughness: 0.9,
  metalness: 0.0
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.8;
floor.receiveShadow = false;
scene.add(floor);

// controls (optional: keep it subtle)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 2.2;
controls.maxDistance = 7.5;
controls.maxPolarAngle = Math.PI * 0.52; // stop going under floor
controls.target.set(0, 0.2, 0);

// model
let car = null;

const loader = new GLTFLoader();
// put your model here:
const MODEL_URL = "../assets/porsche911.glb";

loader.load(
  MODEL_URL,
  (gltf) => {
    car = gltf.scene;
    car.position.set(0, -0.75, 0);
    car.rotation.y = Math.PI * 0.25;

    // scale: adjust if too big/small
    car.scale.set(1.2, 1.2, 1.2);

    scene.add(car);
  },
  undefined,
  (err) => {
    console.error("GLB load error:", err);
  }
);

// nice background fog for depth
scene.fog = new THREE.Fog(0x0b0f17, 6, 18);

// animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // slow idle rotation if model is loaded
  if (car) {
    car.rotation.y += 0.002; // subtle spin
    car.position.y = -0.75 + Math.sin(t * 1.2) * 0.01; // tiny float
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
