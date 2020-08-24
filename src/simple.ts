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
    var ground = BABYLON.Mesh.CreateGround("ground", 6, 6, 2, scene);


    // 左手のコントローラーを触った時に反応するオブジェクトたち
    var Box_Left_MainTrigger = BABYLON.MeshBuilder.CreateBox("Box_Left_MainTrigger", {}, scene);
    Box_Left_MainTrigger.position = new BABYLON.Vector3(-2.5, 1, 6);
    var Box_Left_SecondaryTrigger = BABYLON.MeshBuilder.CreateBox("Box_Left_SedondaryTrigger", {}, scene);
    Box_Left_SecondaryTrigger.position = new BABYLON.Vector3(-2, 1, 3);
    var Sphere_Left_YButton = BABYLON.MeshBuilder.CreateSphere("Sphere_Left_YButton", {diameter:1}, scene);
    Sphere_Left_YButton.position = new BABYLON.Vector3(-2, 0, 3);
    var Sphere_Left_XButton = BABYLON.MeshBuilder.CreateSphere("Sphere_Left_XButton", {diameter:1}, scene);
    Sphere_Left_XButton.position = new BABYLON.Vector3(-2, 0, 2);
    var Box_Left_Stick = BABYLON.MeshBuilder.CreateBox("Box_Left_Stick", {size:0.5}, scene);
    Box_Left_Stick.position = new BABYLON.Vector3(-1, 0, 1);
    const leftHand = BABYLON.Mesh.CreateBox("leftHand", 0.1, scene);
    leftHand.scaling.z = 2;
    leftHand.isVisible =false;


    // 右手のコントローラーを触った時に反応するオブジェクトたち
    var Box_Right_MainTrigger = BABYLON.MeshBuilder.CreateBox("Box_Right_MainTrigger", {}, scene);
    Box_Right_MainTrigger.position = new BABYLON.Vector3(2.5, 1, 6);
    var Box_Right_SecondaryTrigger = BABYLON.MeshBuilder.CreateBox("Box_Right_SedondaryTrigger", {}, scene);
    Box_Right_SecondaryTrigger.position = new BABYLON.Vector3(2, 1, 3);
    var Sphere_Right_BButton = BABYLON.MeshBuilder.CreateSphere("Sphere_Right_BButton", {diameter:1}, scene);
    Sphere_Right_BButton.position = new BABYLON.Vector3(2, 0, 3);
    var Sphere_Right_AButton = BABYLON.MeshBuilder.CreateSphere("Sphere_Right_AButton", {diameter:1}, scene);
    Sphere_Right_AButton.position = new BABYLON.Vector3(2, 0, 2);
    var Box_Right_Stick = BABYLON.MeshBuilder.CreateBox("Box_Right_Stick", {size:0.5}, scene);
    Box_Right_Stick.position = new BABYLON.Vector3(1, 0, 1);
    const rightHand = BABYLON.Mesh.CreateBox("rightHand", 0.1, scene);
    rightHand.scaling.z = 2;
    rightHand.isVisible =false;


    // ログ出力用のTextBlock
    var plane = BABYLON.MeshBuilder.CreatePlane("plane", {size:1});
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


    // XRをサポートしている環境かどうか確認する
    const supported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-vr');
    if (!supported) {
        return scene;
    }
    console.log("xr supported");

    // 地面を指定してXR環境を初期化
    var vrHelper = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [ground]
    });
    console.log('xrHelper: ', vrHelper);


    // コントローラーを初期化
    vrHelper.input.onControllerAddedObservable.add((inputSource) => {
        header.text = "vrHelper.input.onControllerAddedObservable";
        console.log('inputSource: ', inputSource);

        inputSource.onMotionControllerInitObservable.add((motionController:WebXRProfiledMotionController) => {
            header.text = "inputSource.onMotionControllerInitObservable";
            console.log('motionController: ', motionController);

            if(motionController.handness === "right"){
                const aButtonComponent = motionController.getComponent("a-button");
                aButtonComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.pressed) {
                        header.text = "A button pressed";
                        Sphere_Right_AButton.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                    }else{
                        Sphere_Right_AButton.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
                    }
                });
                const bButtonComponent = motionController.getComponent("b-button");
                bButtonComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.pressed) {
                        header.text = "B button pressed";
                        Sphere_Right_BButton.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                    }else{
                        Sphere_Right_BButton.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
                    }
                });
                const mainTriggerComponent = motionController.getComponent("xr-standard-trigger");
                mainTriggerComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.pressed) {
                        header.text = "right main trigger pressed";
                        Box_Right_MainTrigger.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                    }else{
                        Box_Right_MainTrigger.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
                    }
                });
                const secondTriggerComponent = motionController.getComponent("xr-standard-squeeze");
                secondTriggerComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.pressed) {
                        header.text = "right second trigger pressed";
                        Box_Right_SecondaryTrigger.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                    }else{
                        Box_Right_SecondaryTrigger.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
                    }
                });
                const thumbstickComponent = motionController.getComponent("xr-standard-thumbstick");
                thumbstickComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.pressed) {
                        header.text = "right thumbstick pressed";
                        Box_Right_Stick.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                    }else{
                        Box_Right_Stick.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
                    }
                });
                thumbstickComponent.onAxisValueChangedObservable.add((component) => {
                    //header.text = "right thumbstick axis, x:"+component.axes.x+" y:"+component.axes.y;
                });
            }else{
                const xButtonComponent = motionController.getComponent("x-button");
                xButtonComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.pressed) {
                        header.text = "X button pressed";
                        Sphere_Left_XButton.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                    }else{
                        Sphere_Left_XButton.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
                    }
                });
                const yButtonComponent = motionController.getComponent("y-button");
                yButtonComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.pressed) {
                        header.text = "Y button pressed";
                        Sphere_Left_YButton.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                    }else{
                        Sphere_Left_YButton.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
                    }
                });
                const mainTriggerComponent = motionController.getComponent("xr-standard-trigger");
                mainTriggerComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.pressed) {
                        header.text = "left main trigger pressed";
                        Box_Left_MainTrigger.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                    }else{
                        Box_Left_MainTrigger.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
                    }
                });
                const secondTriggerComponent = motionController.getComponent("xr-standard-squeeze");
                secondTriggerComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.pressed) {
                        header.text = "left second trigger pressed";
                        Box_Left_SecondaryTrigger.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                    }else{
                        Box_Left_SecondaryTrigger.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
                    }
                });
                const thumbstickComponent = motionController.getComponent("xr-standard-thumbstick");
                thumbstickComponent.onButtonStateChangedObservable.add((component) => {
                    if(component.pressed) {
                        header.text = "left thumbstick pressed";
                        Box_Left_Stick.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
                    }else{
                        Box_Left_Stick.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
                    }
                });
                thumbstickComponent.onAxisValueChangedObservable.add((component) => {
                    //header.text = "left thumbstick axis is x:"+thumbstickAxes.x+" y:"+thumbstickAxes.y;
                });
                
            }
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
        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });
    } catch (err) {
        console.error(err);
    }
})();