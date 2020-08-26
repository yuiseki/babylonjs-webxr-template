
import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { WebXRProfiledMotionController } from '@babylonjs/core';
import AbstractOculusQuestController from './lib/AbstractOculusQuestController';
import BabylonEnvironment from './lib/BabylonEnvironment';

var canvas:HTMLCanvasElement = document.getElementById("renderCanvas") as HTMLCanvasElement;

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

const createScene = async (engine) => {
  var env = new BabylonEnvironment(engine, canvas);

  // ログ出力用のTextBlock
  var textBlock = createTextBlock();

  const xrSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-vr');
  console.log("xrSupported: "+xrSupported);
  if (!xrSupported) {
      return env.scene;
  }
  var xrHelper = await env.scene.createDefaultXRExperienceAsync({
      floorMeshes: [env.ground1]
  });

  let controller = new OculusQuestController(xrHelper, env, textBlock);

  return env.scene;
};

const createTextBlock = () => {
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
  return textBlock;
};

class OculusQuestController extends AbstractOculusQuestController {
  textBlock: GUI.TextBlock;
  env: BabylonEnvironment;

  constructor(xrHelper, env, textBlock){
    super(xrHelper)
    this.env = env;
    this.textBlock = textBlock;
  }

  shoot(controller){
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere"+(new Date().getTime()), {diameter:0.1}, this.env.scene);
    // 球体の位置はコントローラーと同じにする
    sphere.position = controller.rootMesh.getAbsolutePosition();
    // 物理演算する指定
    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 5 }, this.env.scene);
    this.env.physicsRoot.addChild(sphere);
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