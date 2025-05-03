/*import * as THREE   from  'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/OBJLoader.js';
*/
import * as THREE from './three.module.js';
import { MTLLoader } from './libs/MTLLoader.js';
import { OBJLoader } from './libs/OBJLoader.js';
import { GLTFLoader } from "./libs/GLTFLoader.js";

let isExpanded = false;
let hasConfigured = false;
let selectedLevel = null;
let selectedDifficulty = null;
let selectedMode = null;

let scene, camera, renderer;
let scenarioGroup;
let cube;
const keys = {};
let clock;

const gameContainer = document.getElementById("gameContainer");
const startOverlay = document.getElementById("startOverlay");
const configOverlay = document.getElementById("configOverlay");
const gameUI = document.getElementById("gameUI");
const quickConfigSidebar = document.getElementById("quickConfigSidebar");

const startGameBtn = document.getElementById("startGameBtn");
const toggleFullscreen = document.getElementById("toggleFullscreen");
const quickConfigBtn = document.getElementById("quickConfigBtn");

const levelStep = document.getElementById("levelStep");
const difficultyStep = document.getElementById("difficultyStep");
const modeStep = document.getElementById("modeStep");

const sidebarLevelSelect = document.getElementById("sidebarLevelSelect");
const sidebarDifficultySelect = document.getElementById("sidebarDifficultySelect");
const sidebarModeSelect = document.getElementById("sidebarModeSelect");
const saveSidebarConfig = document.getElementById("saveSidebarConfig");
const closeSidebarConfig = document.getElementById("closeSidebarConfig");


// Configuración guardada
/*
const savedConfig = localStorage.getItem("gameConfig");
if (savedConfig) {
  const configObj = JSON.parse(savedConfig);
  selectedLevel = configObj.level;
  selectedDifficulty = configObj.difficulty;
  selectedMode = configObj.mode;
  hasConfigured = true;
  quickConfigBtn.classList.remove("hidden");
}*/

initThreeScene();
if (selectedLevel) loadCurrentLevel();

// BOTONES
startGameBtn.addEventListener("click", () => {
  if (!hasConfigured) {
    startOverlay.classList.add("hidden");
    openConfigOverlay();
  } else {
    startOverlay.classList.add("hidden");
    gameUI.classList.remove("hidden");
    loadCurrentLevel();
  }
});

toggleFullscreen.addEventListener("click", () => {
  isExpanded = !isExpanded;
  gameContainer.classList.toggle("expanded", isExpanded);
  toggleFullscreen.textContent = isExpanded ? "Reducir" : "Expandir";
});
gameContainer.addEventListener('transitionend', handleResize);

quickConfigBtn.addEventListener("click", () => {
  quickConfigSidebar.classList.remove("hidden");
  sidebarLevelSelect.value = selectedLevel || "Ciudad en Ruinas";
  sidebarDifficultySelect.value = selectedDifficulty || "Fácil";
  sidebarModeSelect.value = selectedMode || "Individual";
});

saveSidebarConfig.addEventListener("click", () => {
  selectedLevel = sidebarLevelSelect.value;
  selectedDifficulty = sidebarDifficultySelect.value;
  selectedMode = sidebarModeSelect.value;
  saveConfig();
  alert(`Nueva Configuración Aplicada\nNivel: ${selectedLevel}\nDificultad: ${selectedDifficulty}\nModo: ${selectedMode}`);
  quickConfigSidebar.classList.add("hidden");
  loadCurrentLevel();
});

closeSidebarConfig.addEventListener("click", () => {
  quickConfigSidebar.classList.add("hidden");
});

document.getElementById("comunidadBtn").addEventListener("click", () => {
  window.location.href = "comunidad.html";
});

// =========================
// CONFIGURACIÓN
// =========================
function openConfigOverlay() {
  configOverlay.classList.remove("hidden");
  levelStep.classList.remove("hidden");
  difficultyStep.classList.add("hidden");
  modeStep.classList.add("hidden");
}

function saveConfig() {
  const data = { level: selectedLevel, difficulty: selectedDifficulty, mode: selectedMode };
  localStorage.setItem("gameConfig", JSON.stringify(data));
}

levelStep.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    selectedLevel = card.dataset.level;
    levelStep.classList.add("hidden");
    difficultyStep.classList.remove("hidden");
  });
});
difficultyStep.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    selectedDifficulty = card.dataset.difficulty;
    difficultyStep.classList.add("hidden");
    modeStep.classList.remove("hidden");
  });
});
modeStep.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    selectedMode = card.dataset.mode;
    hasConfigured = true;
    configOverlay.classList.add("hidden");
    startOverlay.classList.remove("hidden");
    quickConfigBtn.classList.remove("hidden");
    saveConfig();
    alert(`Configuración Completa\nNivel: ${selectedLevel}\nDificultad: ${selectedDifficulty}\nModo: ${selectedMode}`);
  });
});

// =========================
// THREE.JS
// =========================
function initThreeScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  const w = gameContainer.clientWidth;
  const h = gameContainer.clientHeight;
  camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 1000);
  camera.position.set(0, 3, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  gameContainer.appendChild(renderer.domElement);

  const geo = new THREE.BoxGeometry();
  const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  cube = new THREE.Mesh(geo, mat);
  cube.position.set(-4, 1.5, 0);
  scene.add(cube);

  document.addEventListener("keydown", e => { keys[e.code] = true; });
  document.addEventListener("keyup", e => { keys[e.code] = false; });

  clock = new THREE.Clock();
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  cube.rotation.x += 0.005;
  cube.rotation.y += 0.005;
  updateCamera(delta);
  renderer.render(scene, camera);
}

function updateCamera(delta) {
  const moveSpeed = 10;
  const rotateSpeed = 1.5;
  if (keys["KeyW"]) camera.translateZ(-moveSpeed * delta);
  if (keys["KeyS"]) camera.translateZ(moveSpeed * delta);
  if (keys["KeyA"]) camera.translateX(-moveSpeed * delta);
  if (keys["KeyD"]) camera.translateX(moveSpeed * delta);
  if (keys["KeyQ"]) camera.rotation.y += rotateSpeed * delta;
  if (keys["KeyE"]) camera.rotation.y -= rotateSpeed * delta;
}

function handleResize() {
  const w = gameContainer.clientWidth;
  const h = gameContainer.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

// =========================
// ESCENARIOS
// =========================
function loadCurrentLevel() {
  if (scenarioGroup) scene.remove(scenarioGroup);
  scenarioGroup = new THREE.Group();
  scene.fog = null;

  if (selectedLevel === "Granja Tenebrosa") {
    loadGranjaTenebrosa();
    loadOBJWithMTL('tractor.obj', { x: -15, y: 0, z: 22 }, { x: 2.0, y: 2.0, z: 2.0 });
    loadOBJWithMTL('gallina.obj', { x: 10, y: 0, z: 12 }, { x: 2.0, y: 2.0, z: 2.0 });
    //loadOBJWithMTL('corral.obj', { x: 17, y: 0, z: 27 }, { x: 2.0, y: 2.0, z: 2.0 }); <--No jala la textura :,V
    loadOBJWithMTL('escopeta.obj', { x: 0, y: 0, z: 1 }, { x: 2.0, y: 2.0, z: 2.0 });
    loadOBJWithMTL('marrano.obj', { x: 5, y: 0, z: -14 }, { x: 2.0, y: 2.0, z: 2.0 });
    loadOBJWithMTL('vaca.obj', { x: -10, y: 0, z: -3 }, { x: 2.0, y: 2.0, z: 2.0 });

    const loaderGLTF = new GLTFLoader();
        loaderGLTF.load( "./assets/Granja.glb",
          function (model) {
            const obj = model.scene;
            obj.scale.set(2.5, 2.5, 2.5);
            obj.position.set(16, 0, 0);
            scene.add(obj);
          }
      );

        loaderGLTF.load( "./assets/Granjero.glb",
          function (model) {
            const obj = model.scene;
            obj.scale.set(2.0, 2.0, 2.0);
            obj.position.set(16, 0, 0);
            scene.add(obj);
          }
      );

      loaderGLTF.load( "./assets/corral.glb",
        function (model) {
          const obj = model.scene;
          obj.scale.set(2.0, 2.0, 2.0);
          obj.position.set(17, 0, 27);
          scene.add(obj);
        }
    );

    loaderGLTF.load( "./assets/cultivos.glb",
      function (model) {
        const obj = model.scene;
        obj.scale.set(2.0, 2.0, 2.0);
        obj.position.set(15, 0, 0);
        scene.add(obj);
      }
  );

  loaderGLTF.load( "./assets/pinos.glb",
    function (model) {
      const obj = model.scene;
      obj.scale.set(5.0, 5.0, 5.0);
      obj.position.set(0, -4, 0);
      scene.add(obj);
    }
);

  loaderGLTF.load( "./assets/Zombie.glb",
    function (model) {
      const obj = model.scene;
      obj.scale.set(2.0, 2.0, 2.0);
      obj.position.set(-16, 0, 3);
      scene.add(obj);
    }
);

  } else if (selectedLevel === "Base Militar") {
    loadBaseMilitar();
  } else {
    loadCiudadEnRuinas();
  }

  scene.add(scenarioGroup);
}

function loadOBJWithMTL(baseName, position, scale) {
  const mtlLoader = new MTLLoader();
  mtlLoader.setPath('./assets/');
  mtlLoader.setResourcePath('./assets/'); // Desde donde se resuelven las rutas a las texturas
  mtlLoader.load(baseName.replace('.obj', '.mtl'), (materials) => {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('assets/');
    objLoader.load(baseName, (object) => {
      object.position.set(position.x, position.y, position.z);
      object.scale.set(scale.x, scale.y, scale.z);
      scenarioGroup.add(object);
    }, undefined, (err) => {
      console.error("Error cargando .obj:", err);
    });
  }, undefined, (err) => {
    console.error("Error cargando .mtl:", err);
  });
}

function loadCiudadEnRuinas() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x555555 })
  );
  ground.rotation.x = -Math.PI / 2;
  scenarioGroup.add(ground);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 10, 5);
  scenarioGroup.add(dirLight);

  for (let i = 0; i < 6; i++) {
    const h = Math.random() * 5 + 5;
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(3, h, 3),
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    building.position.set((Math.random() - 0.5) * 25, h / 2, (Math.random() - 0.5) * 25);
    scenarioGroup.add(building);
  }
}

function loadGranjaTenebrosa() {
  scene.fog = new THREE.Fog(0x000000, 5, 30);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x003300 })
  );
  ground.rotation.x = -Math.PI / 2;
  scenarioGroup.add(ground);

  /*for (let i = 0; i < 10; i++) {
    const tronco = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.5, 3),
      new THREE.MeshStandardMaterial({ color: 0x654321 })
    );
    const copa = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x002200 })
    );
    copa.position.y = 2.2;

    const arbol = new THREE.Group();
    arbol.add(tronco);
    arbol.add(copa);
    arbol.position.set((Math.random() - 0.5) * 25, 1.5, (Math.random() - 0.5) * 25);
    scenarioGroup.add(arbol);
  }*/

  scenarioGroup.add(new THREE.AmbientLight(0xffffff, 0.2));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
  dirLight.position.set(10, 10, 5);
  scenarioGroup.add(dirLight);
}

function loadBaseMilitar() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x556655 })
  );
  ground.rotation.x = -Math.PI / 2;
  scenarioGroup.add(ground);

  const wallGeo = new THREE.BoxGeometry(40, 2, 0.5);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x444444 });

  const wall1 = new THREE.Mesh(wallGeo, wallMat);
  wall1.position.set(0, 1, 20);
  scenarioGroup.add(wall1);

  const wall2 = wall1.clone(); wall2.position.set(0, 1, -20); scenarioGroup.add(wall2);
  const wallSide1 = new THREE.Mesh(wallGeo, wallMat); wallSide1.rotation.y = Math.PI / 2; wallSide1.position.set(20, 1, 0); scenarioGroup.add(wallSide1);
  const wallSide2 = wallSide1.clone(); wallSide2.position.set(-20, 1, 0); scenarioGroup.add(wallSide2);

  for (let i = 0; i < 4; i++) {
    const cont = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    cont.position.set(-10 + i * 4, 1, Math.random() * 6 - 3);
    scenarioGroup.add(cont);
  }

  scenarioGroup.add(new THREE.AmbientLight(0xffffff, 0.3));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(10, 10, 5);
  scenarioGroup.add(dirLight);
}
