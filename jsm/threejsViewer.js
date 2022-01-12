import * as THREE from '../threejs/build/three.module.js';
import { MarchingCubes } from '../threejs/examples/jsm/objects/MarchingCubes.js';
import { OrbitControls } from '../threejs/examples/jsm/controls/OrbitControls.js';

class threejsViewer {
  constructor(domElement) {
    this.size = 0;
    this.databuffer = null;
    this.textureOption = 0;
    this.threshold = 75;
    this.enableLine = false;
    this.mesh = null;

    let width = domElement.clientWidth;
    let height = domElement.clientHeight;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xe6e6fa, 1.0);
    domElement.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    let aspect = window.innerWidth / window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 50);
    this.camera.position.set(2, 1, 2);
    this.scene.add(this.camera);

    // Light
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 1, 2);
    this.scene.add(directionalLight);

    // Controller
    let controller = new OrbitControls(this.camera, this.renderer.domElement);
    controller.target.set(0, 0.5, 0);
    controller.update();

    //Axis Landmark
    const axesHelper = new THREE.AxesHelper(100);
    this.scene.add(axesHelper);

    // Ground
    const plane = new THREE.Mesh(
      new THREE.CircleGeometry(2, 30),
      new THREE.MeshPhongMaterial({
        color: 0xbbddff,
        opacity: 0.4,
        transparent: true,
      })
    );
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    let scope = this;
    this.renderScene = function () {
      requestAnimationFrame(scope.renderScene);
      scope.renderer.render(scope.scene, scope.camera);
    };

    //視窗變動時 ，更新畫布大小以及相機(投影矩陣)繪製的比例
    window.addEventListener('resize', () => {
      //update render canvas size
      let width = domElement.clientWidth;
      let height = domElement.clientHeight;
      this.renderer.setSize(width, height);

      //update camera project aspect
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    });

    this.renderScene();
  }

  // 因為matching cube規定固定大小 => 只要一個size
  // loadData(paddingData, size, isolationValue) {
  //   this.mesh = new MarchingCubes(size); //這種方式讀取是不完全的 再下載時還要做一個動作
  //   //還要下載要call generateGeometry method
  //   //使用phong default
  //   mesh.material = new THREE.MeshPhongMaterial(); //TODO丟材質
  //   mesh.isolation = isolationValue; //TODO丟isolationValue數值
  //   mesh.field = paddingData; //TODO丟做好的paddingData

  //   //將這個mesh加入scene
  //   this.scene.add(mesh);
  // }

  matchingCubeSetting() {
    switch (this.textureOption) {
      case 0:
      // this.mesh.material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
      // break;
      case 1:
        this.mesh.material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
        break;
      case 2:
        this.mesh.material = new THREE.MeshToonMaterial({ color: 0xff00ff });
        break;
      case 3:
        this.mesh.material = new THREE.MeshNormalMaterial({
          color: 0xff00ff,
        });
    }
    this.mesh.isolation = this.threshold;
    document.querySelector('#isoValue').textContent = this.threshold;
    this.mesh.field = this.databuffer;
    this.mesh.position.set(0, 1, 0);
  }

  updateModel() {
    //geometry + material => mesh
    //這個mesh有功能上的缺失
    let mesh = this.scene.getObjectByName('mesh');

    if (mesh === undefined || mesh === null) {
      //初始化
      //如果是gpu就不要再加額的code，如果不是就還要在加
      this.mesh = new MarchingCubes(this.size);
      this.mesh.name = 'mesh';
      this.matchingCubeSetting();

      this.scene.add(this.mesh);
      return this.mesh;
    } else {
      this.matchingCubeSetting();
    }
  }

  download() {
    let geometry = this.mesh.generateGeometry(); //可以讀取一個完整資料

    let mesh = new THREE.Mesh(geometry);

    return mesh;
  }
}

export { threejsViewer };
