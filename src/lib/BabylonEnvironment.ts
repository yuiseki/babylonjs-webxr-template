import * as BABYLON from '@babylonjs/core';

export default class BabylonEnvironment{
  canvas: HTMLCanvasElement;
  scene: BABYLON.Scene;
  light1: BABYLON.HemisphericLight;
  camera1: BABYLON.ArcRotateCamera;
  environment: any;
  ground1: BABYLON.Mesh;
  physicsRoot: BABYLON.Mesh;

  constructor(engine, canvas){
    this.scene = new BABYLON.Scene(engine);
    this.canvas = canvas;
    this.initializeEnvironment();
  }

  /**
   * 適当な環境を初期化する
   */
  initializeEnvironment = () => {
    // 適当な物理エンジン
    var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
    this.scene.enablePhysics(gravityVector);
    // なんか必要らしい
    this.physicsRoot = new BABYLON.Mesh("physicsRoot", this.scene);
    this.physicsRoot.position.y -= 0.9;
    this.physicsRoot.scaling.scaleInPlace(1.0)
    this.physicsRoot.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.physicsRoot,
      BABYLON.PhysicsImpostor.NoImpostor,
      { mass: 3 },
      this.scene
    );
    // 適当な光源
    this.light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), this.scene);
    // 適当なカメラ
    this.camera1 = new BABYLON.ArcRotateCamera('camera1', 0, 0, 3, new BABYLON.Vector3(0, 1.2, 0), this.scene, true);
    this.camera1.position = new BABYLON.Vector3(0, 1.2, -1.1);
    this.camera1.attachControl(this.canvas, true);
    this.camera1.inputs.attached.mousewheel.detachControl(this.canvas);
    // 空
    this.environment = this.scene.createDefaultEnvironment();
    this.environment.setMainColor(BABYLON.Color3.FromHexString("#74b9ff"));
    // 地面
    this.ground1 = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, this.scene);
    // 地面に物理演算を適用する
    this.ground1.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.ground1,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, friction: 0.5, restitution: 0.7 },
      this.scene
    );
  }
}