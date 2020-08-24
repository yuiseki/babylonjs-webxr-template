import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { WebXRProfiledMotionController } from '@babylonjs/core';

var canvas:HTMLCanvasElement = document.getElementById("renderCanvas") as HTMLCanvasElement;

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
    var header = new GUI.TextBlock();
    header.text = "Text Block";
    header.height = "150px";
    header.width = "1400px";
    header.color = "white";
    header.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    header.fontSize = "60";
    panel.addControl(header);
    
    // XRが動く環境かチェック
    const xrSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-vr');
    console.log("xrSupported: "+xrSupported);
    if (!xrSupported) {
        return scene;
    }
    
    // ここから重要
    var xrHelper = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [ground1]
    });

    xrHelper.input.onControllerAddedObservable.add((inputSource) => {
        inputSource.onMotionControllerInitObservable.add((motionController: WebXRProfiledMotionController) => {
            if(motionController.handness === "right"){
                // 右手にしかないボタン
                const aButtonComponent = motionController.getComponent("a-button");
                aButtonComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.value > 0.8 && component.pressed) {
                        header.text = "a button pressed";
                    }
                });
                const bButtonComponent = motionController.getComponent("b-button");
                bButtonComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.value > 0.8 && component.pressed) {
                        header.text = "b button pressed";
                    }
                });
            }else{
              // 左手にしかないボタン
                const xButtonComponent = motionController.getComponent("x-button");
                xButtonComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.value > 0.8 && component.pressed) {
                        header.text = "x button pressed";
                    }
                });
                const yButtonComponent = motionController.getComponent("y-button");
                yButtonComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.value > 0.8 && component.pressed) {
                        header.text = "y button pressed";
                    }
                });
            }
             // 両手にあるボタン
            const mainTriggerComponent = motionController.getComponent("xr-standard-trigger");
            mainTriggerComponent.onButtonStateChangedObservable.add((component) => {
                if(component.value > 0.8 && component.pressed) {
                    header.text = motionController.handness+" main trigger pressed";
                }
            });
            const subTriggerComponent = motionController.getComponent("xr-standard-squeeze");
            subTriggerComponent.onButtonStateChangedObservable.add((component) => {
                if(component.value > 0.8 && component.pressed) {
                    header.text = motionController.handness+" sub trigger pressed";
                }
            });
            const thumbStickComponent = motionController.getComponent("xr-standard-thumbstick");
            thumbStickComponent.onButtonStateChangedObservable.add((component) => {
                if(component.value > 0.8 && component.pressed) {
                    header.text = motionController.handness+" thumbstick pressed";
                }
            });
        });
    });
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