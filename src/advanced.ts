import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { WebXRProfiledMotionController, WebXRControllerPhysics, WebXRControllerPointerSelection, WebXRMotionControllerTeleportation, WebXRInputSource } from '@babylonjs/core';

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
    var ground1 = BABYLON.MeshBuilder.CreateGround("ground1", {width:50, height:50, subdivisions:4}, scene);

    // ランダムなVector3を生成する
    const createRandomVector3 = () => {
        // 1から5までのfloatをランダムに得る
        const x = (Math.round(Math.random())*2-1)*Math.random()*5;
        const y = Math.random()*5;
        const z = (Math.round(Math.random())*2-1)*Math.random()*5;
        return new BABYLON.Vector3(x, y, z);
    }

    // テスト用のオブジェクトをランダムに20個配置する
    const count = Math.round(Math.random()*20);
    let i = 0;
    while( i < count){
        i++;
        var box = BABYLON.MeshBuilder.CreateBox("box"+i, {size:0.1}, scene);
        box.position = createRandomVector3();

        var sphere = BABYLON.MeshBuilder.CreateSphere("sphere"+i, {diameter:0.1}, scene);
        sphere.position = createRandomVector3();
    }

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
    try {
        const setGrab = (inputSource:WebXRInputSource, controller:WebXRProfiledMotionController) => {
            let grabbedMesh:BABYLON.AbstractMesh = null;
            let originalPosition = null;
            // トリガーで掴む
            const triggerComponent = controller.getComponent("xr-standard-trigger");
            triggerComponent.onButtonStateChangedObservable.add((component)=>{
                if(component.value > 0.8 && component.pressed){
                    // トリガーを握った
                    if(grabbedMesh === null){
                        // 何も掴んでいない状態
                        // 掴みたいMeshを得る
                        // MEMO: scene.meshUnderPointer を使うと左右のコントローラーの区別ができないので使うべきではない
                        // MEMO: xrHelper.pointerSelection.getMeshUnderPointer(controller.profileId); は常に null
                        // xrHelper.pointerSelection.getMeshUnderPointer() には inputSource.uniqueIdを入れるべき
                        grabbedMesh = xrHelper.pointerSelection.getMeshUnderPointer(inputSource.uniqueId);
                        console.log("grabbedMesh: "+grabbedMesh);
                        if(grabbedMesh !== null){
                            // 掴みたいMeshの元のPositionを覚えておく
                            if(originalPosition === null){
                                originalPosition = new BABYLON.Vector3(grabbedMesh.position.x, grabbedMesh.position.y, grabbedMesh.position.z);
                            }
                            grabbedMesh.position = controller.rootMesh.absolutePosition;
                        }
                    }else{
                        // 既になにか掴んでいる状態
                        // 掴んでる間はコントローラーと同じ座標に追随させる
                        grabbedMesh.position = controller.rootMesh.absolutePosition;
                    }
                }else{
                    // 離した
                    // 掴んでいたMeshを元のPositionに戻す
                    if(grabbedMesh !== null && originalPosition !== null){
                        grabbedMesh.position = originalPosition;
                        originalPosition = null;
                        grabbedMesh = null;
                    }
                }
            });
        };
        xrHelper.input.onControllerAddedObservable.add((inputSource)=>{
            console.log("inputSource: ", inputSource);
            inputSource.onMotionControllerInitObservable.add((controller:WebXRProfiledMotionController)=>{
                if(!xrHelper.pointerSelection.getMeshUnderPointer){
                    return;
                }
                console.log("controller: ", controller);
                setGrab(inputSource, controller);
            });
        });
    } catch (error) {
        console.error(error);
    }

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