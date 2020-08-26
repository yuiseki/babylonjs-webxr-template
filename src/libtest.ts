
import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';


import AbstractOculusQuestController from './lib/AbstractOculusQuestController';

var canvas:HTMLCanvasElement = document.getElementById("renderCanvas") as HTMLCanvasElement;

/**
 * AbstractOculusQuestControllerを継承してここでコントローラーで実際にやりたい挙動を実装する
 */
class OculusQuestController extends AbstractOculusQuestController {
  scene: any;
  physicsRoot: any;
  textBlock: GUI.TextBlock;
  
  constructor(xrHelper, scene, physicsRoot, textBlock){
    super(xrHelper);
    this.scene = scene;
    this.physicsRoot = physicsRoot;
    this.textBlock = textBlock;
  }

  // 左右のコントローラーのトリガー共通の処理
  shoot(controller){
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere"+(new Date().getTime()), {diameter:0.1}, this.scene);
    // 球体の位置はコントローラーと同じにする
    sphere.position = this.getControllerPosition(controller);
    // 物理演算するように指定
    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 5 }, this.scene);
    this.physicsRoot.addChild(sphere);
    // コントローラーとおなじ方向に発射したいのでコントローラーの向きを得る
    let direction = this.getControllerDirection(controller);
    // なぜかやや上向きなので微調整する
    var forceDirection = new BABYLON.Vector3(direction.x, direction.y-0.5, direction.z);
    var forceMagnitude = 30;
    // 球体に力を加えて発射する
    sphere.physicsImpostor.applyImpulse(forceDirection.scale(forceMagnitude), sphere.getAbsolutePosition());
  }

  onAButtonPressed(controller, component) {
    this.textBlock.text = "A Button Pressed";
    this.shoot(controller);
  }

  onBButtonPressed(controller, component) {
    this.textBlock.text = "B Button Pressed";
    this.shoot(controller);
  }

  onXButtonPressed(controller, component) {
    this.textBlock.text = "X Button Pressed";
    this.shoot(controller);
  }

  onYButtonPressed(controller, component) {
    this.textBlock.text = "Y Button Pressed";
    this.shoot(controller);
  }

  onAnyTriggered(controller, component) {
    this.shoot(controller);
  }

  onRightTriggered(controller, component) {
    this.textBlock.text = "Right triggered";
  }

  onLeftTriggered(controller, component) {
    this.textBlock.text = "Left triggered";
  }

  onAnySqueezed(controller, component) {
    this.shoot(controller);
  }

  onRightSqueezed(controller, component) {
    this.textBlock.text = "Right squeezed";
  }

  onLeftSqueezed(controller, component) {
    this.textBlock.text = "Left squeezed";
  }

  onAnyThumbStickPressed(controller, component) {
    this.shoot(controller);
  }

  onRightThumbStickPressed(controller, component) {
    this.textBlock.text = "Right Thumb Stick Pressed";
  }

  onLeftThumbStickPressed(controller, component) {
    this.textBlock.text = "Left Thumb Stick Pressed";
  }

}


var createScene = async function (engine) {
  var scene = new BABYLON.Scene(engine);
  // 適当な光源
  var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
  // 適当なカメラ
  var camera1 = new BABYLON.ArcRotateCamera('camera1', 0, 0, 3, new BABYLON.Vector3(0, 1.2, 0), scene, true);
  camera1.position = new BABYLON.Vector3(0, 1.2, -1.1);
  camera1.attachControl(canvas, true);
  camera1.inputs.attached.mousewheel.detachControl(canvas);
  // 空
  var environment = scene.createDefaultEnvironment();
  environment.setMainColor(BABYLON.Color3.FromHexString("#74b9ff"));
  // 地面
  var ground1 = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

  // ログ出力用のTextBlock
  var plane = BABYLON.MeshBuilder.CreatePlane("plane", {size: 1});
  plane.position = new BABYLON.Vector3(0, 1, 0);
  var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
  var panel = new GUI.StackPanel();
  advancedTexture.addControl(panel);
  var textBlock = new GUI.TextBlock();
  textBlock.text = "Text Block";
  textBlock.height = "150px";
  textBlock.width = "1400px";
  textBlock.color = "white";
  textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  textBlock.fontSize = "60";
  panel.addControl(textBlock);

  // 適当な物理エンジン
  var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
  scene.enablePhysics(gravityVector);
  // なんか必要らしい
  var physicsRoot = new BABYLON.Mesh("physicsRoot", scene);
  physicsRoot.position.y -= 0.9;
  physicsRoot.scaling.scaleInPlace(1.0)
  physicsRoot.physicsImpostor = new BABYLON.PhysicsImpostor(
    physicsRoot,
    BABYLON.PhysicsImpostor.NoImpostor,
    { mass: 3 },
    scene
  );

  // 地面に物理演算を適用する
  ground1.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground1,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, friction: 0.5, restitution: 0.7 },
    scene
  );

  const xrSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-vr');
  console.log("xrSupported: "+xrSupported);
  if (!xrSupported) {
      return scene;
  }
  var xrHelper = await scene.createDefaultXRExperienceAsync({
      floorMeshes: [ground1]
  });

  // さっきのコントローラーを初期化する
  let controller = new OculusQuestController(xrHelper, scene, physicsRoot, textBlock);

  return scene;
};

(async () => {
  try {
    var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    var scene = await createScene(engine);
    engine.runRenderLoop(function () {
      if (scene) {
        scene.render();
      }
    });
    window.addEventListener("resize", function () {
      engine.resize();
    });
  } catch (err) {
    console.error(err);
  }
})();
