import {
  Engine,
  Scene,
  HemisphericLight,
  Vector3,
  Color3,
  ArcRotateCamera,
  MeshBuilder,
  StandardMaterial,
  PhysicsImpostor,
  Mesh,
  WebXRSessionManager,
} from '@babylonjs/core';


import AbstractOculusQuestController from './lib/AbstractOculusQuestController';
import IncrementalTextBlock from './lib/IncrementalTextBlock'
import PolyObject from './lib/PolyObject';

/**
 * このステージでのコントローラーの実装
 */
class OculusQuestController extends AbstractOculusQuestController {
  scene: Scene;
  physicsRoot: Mesh;
  incrementalTextBlock: IncrementalTextBlock;
  constructor(xrHelper, scene, physicsRoot, incrementalTextBlock){
    super(xrHelper);
    this.scene = scene;
    this.physicsRoot = physicsRoot;
    this.incrementalTextBlock = incrementalTextBlock;
  }
  // 左右のコントローラーのトリガー共通の処理
  shoot(controller){
    var sphere = MeshBuilder.CreateSphere("sphere-"+(new Date().getTime()), {diameter:0.1}, this.scene);
    // 球体の位置はコントローラーと同じにする
    sphere.position = this.getControllerPosition(controller);
    // 物理演算するように指定
    sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, { mass: 5 }, this.scene);
    this.physicsRoot.addChild(sphere);
    // コントローラーとおなじ方向に発射したいのでコントローラーの向きを得る
    let direction = this.getControllerDirection(controller);
    // なぜかやや上向きなので微調整する
    var forceDirection = new Vector3(direction.x, direction.y-0.5, direction.z);
    var forceMagnitude = 100;
    // 球体に力を加えて発射する
    sphere.physicsImpostor.applyImpulse(forceDirection.scale(forceMagnitude), sphere.getAbsolutePosition());
    this.incrementalTextBlock.addNewLine("shoot: "+sphere.name);
  }
  onAButtonPressed(controller, component) {
    this.incrementalTextBlock.addNewLine("A Button Pressed");
  }
  onBButtonPressed(controller, component) {
    this.incrementalTextBlock.addNewLine("B Button Pressed");
  }
  onXButtonPressed(controller, component) {
    this.incrementalTextBlock.addNewLine("X Button Pressed");
  }
  onYButtonPressed(controller, component) {
    this.incrementalTextBlock.addNewLine("Y Button Pressed");
  }
  onAnyTriggered(controller, component) {
    this.shoot(controller);
  }
  onRightTriggered(controller, component) {
    this.incrementalTextBlock.addNewLine("Right triggered");
  }
  onLeftTriggered(controller, component) {
    this.incrementalTextBlock.addNewLine("Left triggered");
  }
  onAnySqueezed(controller, component) {
  }
  onRightSqueezed(controller, component) {
    this.incrementalTextBlock.addNewLine("Right squeezed");
  }
  onLeftSqueezed(controller, component) {
    this.incrementalTextBlock.addNewLine("Left squeezed");
  }
  onAnyThumbStickPressed(controller, component) {
  }
  onRightThumbStickPressed(controller, component) {
    this.incrementalTextBlock.addNewLine("Right Thumb Stick Pressed");
  }
  onLeftThumbStickPressed(controller, component) {
    this.incrementalTextBlock.addNewLine("Left Thumb Stick Pressed");
  }
}


var canvas:HTMLCanvasElement = document.getElementById("renderCanvas") as HTMLCanvasElement;
var createScene = async function (engine) {
  var scene = new Scene(engine);
  // 適当な光源
  var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
  // 適当なカメラ
  var camera1 = new ArcRotateCamera('camera1', 0, 0, 3, new Vector3(0, 1.2, 0), scene, true);
  camera1.position = new Vector3(0, 1.2, -1.1);
  camera1.attachControl(canvas, true);
  camera1.inputs.attached.mousewheel.detachControl(canvas);
  // 空
  var environment = scene.createDefaultEnvironment();
  environment.setMainColor(Color3.FromHexString("#20324e"));
  // 地面
  var ground1 = Mesh.CreateGround("ground1", 100, 100, 2, scene);
  var groundMaterial = new StandardMaterial("myMaterial", scene);
  groundMaterial.alpha = 0.2;
  ground1.material = groundMaterial;

  // 適当な物理エンジン
  var gravityVector = new Vector3(0,-9.81, 0);
  scene.enablePhysics(gravityVector);
  // なんか必要らしい
  var physicsRoot = new Mesh("physicsRoot", scene);
  physicsRoot.position.y -= 0.9;
  physicsRoot.scaling.scaleInPlace(1.0)
  physicsRoot.physicsImpostor = new PhysicsImpostor(
    physicsRoot,
    PhysicsImpostor.NoImpostor,
    { mass: 3 },
    scene
  );

  // 地面に物理演算を適用する
  ground1.physicsImpostor = new PhysicsImpostor(
    ground1,
    PhysicsImpostor.BoxImpostor,
    { mass: 0, friction: 0.5, restitution: 0.7 },
    scene
  );

  const polyObject = new PolyObject(scene, "bgkIgHjjz9e");
  await polyObject.ready;

  const xrSupported = await WebXRSessionManager.IsSessionSupportedAsync('immersive-vr');
  console.log("xrSupported: "+xrSupported);
  if (!xrSupported) {
      return scene;
  }
  var xrHelper = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [ground1]
  });

  let incrementalTextBlock = new IncrementalTextBlock(scene);
  incrementalTextBlock.addNewLine("Loading...");
  incrementalTextBlock.addNewLine("Complete.");

  // さっきのコントローラーを初期化する
  let controller = new OculusQuestController(xrHelper, scene, physicsRoot, incrementalTextBlock);

  return scene;
};

const createEnemy = (scene) => {
  console.log("createEnemy");
    /**
     * ランダムなVector3を生成する
     * 
     * @returns BABYLON.Vector3
     */
    const createRandomVector3 = () => {
      // 1から3までのfloatをランダムに得る
      const x = (Math.round(Math.random())*2-1)*Math.random()*1;
      const y = Math.random()*2;
      const z = 1+(Math.random()*3);
      return new Vector3(x, y, z);
    }

    /**
     * テスト用のオブジェクトをランダムに配置する
     * 各オブジェクトに物理演算するように指定する
     *
     * @param scene 
     */
    const createRandomObjects = (scene) => {
      const int = Math.floor(Math.random()*10);
      if(int%2===0){
        // 四角形を生成
        var box = MeshBuilder.CreateBox("box"+(new Date().getTime()), {size:0.1}, scene);
        // 四角形の位置を指定
        box.position = createRandomVector3();
        box.onCollideObservable.add((eventData, eventState)=>{
          box.visibility = 0;
        });
      }else{
        // 球体を生成
        var sphere = MeshBuilder.CreateSphere("sphere"+(new Date().getTime()), {diameter:0.1}, scene);
        // 球体の位置を指定
        sphere.position = createRandomVector3();
        sphere.onCollideObservable.add((eventData, eventState)=>{
          sphere.visibility = 0;
        });
      }

    }
    createRandomObjects(scene);
}

(async () => {
  try {
    var engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = await createScene(engine);
    var time = 0;
    engine.runRenderLoop(function () {
      time++;
      if (scene) {
        scene.render();
        if((time%60)===0){
          createEnemy(scene);
        }
      }
    });
    window.addEventListener("resize", function () {
      engine.resize();
    });
  } catch (err) {
    console.error(err);
  }
})();
