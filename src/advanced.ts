import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { WebXRProfiledMotionController, WebXRControllerPhysics, WebXRControllerPointerSelection, WebXRMotionControllerTeleportation } from '@babylonjs/core';

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
    var ground1 = BABYLON.MeshBuilder.CreateGround("ground1", {width:50, height:50, subdivisions:2}, scene);
    
    // ログ出力用のTextBlock
    var planeX = BABYLON.MeshBuilder.CreatePlane("planeX", {size: 1});
    planeX.position = new BABYLON.Vector3(1.5, 1, 0);
    var advancedTextureX = GUI.AdvancedDynamicTexture.CreateForMesh(planeX);
    var panelX = new GUI.StackPanel();
    advancedTextureX.addControl(panelX);
    var headerX = new GUI.TextBlock();
    headerX.text = "Text Block X";
    headerX.height = "150px";
    headerX.width = "1400px";
    headerX.color = "white";
    headerX.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    headerX.fontSize = "60";
    panelX.addControl(headerX);

    var planeY = BABYLON.MeshBuilder.CreatePlane("planeY", {size: 1});
    planeY.position = new BABYLON.Vector3(0, 1.5, 0);
    var advancedTextureY = GUI.AdvancedDynamicTexture.CreateForMesh(planeY);
    var panelY = new GUI.StackPanel();
    advancedTextureY.addControl(panelY);
    var headerY = new GUI.TextBlock();
    headerY.text = "Text Block Y";
    headerY.height = "150px";
    headerY.width = "1400px";
    headerY.color = "white";
    headerY.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    headerY.fontSize = "60";
    panelY.addControl(headerY);

    var planeZ = BABYLON.MeshBuilder.CreatePlane("planeZ", {size: 1});
    planeZ.position = new BABYLON.Vector3(0, 1, 1.5);
    var advancedTextureZ = GUI.AdvancedDynamicTexture.CreateForMesh(planeZ);
    var panelZ = new GUI.StackPanel();
    advancedTextureZ.addControl(panelZ);
    var headerZ = new GUI.TextBlock();
    headerZ.text = "Text Block Z";
    headerZ.height = "150px";
    headerZ.width = "1400px";
    headerZ.color = "white";
    headerZ.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    headerZ.fontSize = "60";
    panelZ.addControl(headerZ);

    

    // テスト用のオブジェクト
    var box1 = BABYLON.MeshBuilder.CreateBox("box1", {size:1}, scene);
    box1.position = new BABYLON.Vector3(1, 1, 1);
    // 殴ると回転する
    box1.onCollideObservable.add((eventData, eventState)=>{
        box1.addRotation(box1.rotation.x+1, box1.rotation.y+1, box1.rotation.z+1);
    });

    var sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere1", {diameter:2}, scene);
    sphere1.position = new BABYLON.Vector3(-1, 1, 1); 

    
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

    // 掴む, 離す
    xrHelper.input.onControllerAddedObservable.add((inputSource)=>{
        inputSource.onMotionControllerInitObservable.add((controller:WebXRProfiledMotionController)=>{
            const squeezeComponent = controller.getComponent("xr-standard-squeeze");
            squeezeComponent.onButtonStateChangedObservable.add((component)=>{
                if(component.value > 0.8 && component.pressed){
                    if(xrHelper.pointerSelection.getMeshUnderPointer){
                        const mesh = xrHelper.pointerSelection.getMeshUnderPointer(controller.profileId);
                        mesh.position = controller.rootMesh.position;
                    }
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