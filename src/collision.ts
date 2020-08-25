import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { WebXRProfiledMotionController, WebXRControllerPhysics } from '@babylonjs/core';
import * as CANNON from 'cannon';

var canvas:HTMLCanvasElement = document.getElementById("renderCanvas") as HTMLCanvasElement;

let pickedColor = null;
var createScene = async function (engine) {
    var scene = new BABYLON.Scene(engine);
    // 適当な物理エンジン
    var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
    scene.enablePhysics(gravityVector);
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
    ground1.physicsImpostor = new BABYLON.PhysicsImpostor(ground1, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);
    
    // なんか必要らしい
    var physicsRoot = new BABYLON.Mesh("physicsRoot", scene);
    physicsRoot.position.y -= 0.9;
    physicsRoot.scaling.scaleInPlace(1.0)
    physicsRoot.physicsImpostor = new BABYLON.PhysicsImpostor(physicsRoot, BABYLON.PhysicsImpostor.NoImpostor, { mass: 3 }, scene);

        
    // ランダムなVector3を生成する
    const createRandomVector3 = () => {
        // 1から3までのfloatをランダムに得る
        const x = (Math.round(Math.random())*2-1)*Math.random()*3;
        const y = Math.random()*5;
        const z = (Math.round(Math.random())*2-1)*Math.random()*3;
        return new BABYLON.Vector3(x, y, z);
    }

    // テスト用のオブジェクトをランダムに100個配置する
    // 各オブジェクトに物理演算するように指定する
    const count = Math.random()*100;
    let i = 0;
    while( i < count){
        i++;
        var box = BABYLON.MeshBuilder.CreateBox("box"+i, {size:0.1}, scene);
        box.position = createRandomVector3();
        box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 5 }, scene);
        physicsRoot.addChild(box)

        var sphere = BABYLON.MeshBuilder.CreateSphere("sphere"+i, {diameter:0.1}, scene);
        sphere.position = createRandomVector3();
        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 5 }, scene);
        physicsRoot.addChild(sphere)
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

    var plane = BABYLON.MeshBuilder.CreatePlane("plane", {size:1});
    plane.position = new BABYLON.Vector3(0.4, 0.5, 0.4)
    var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
    var panel = new GUI.StackPanel();    
    advancedTexture.addControl(panel);  
    var header = new GUI.TextBlock();
    header.text = "Color Picker";
    header.height = "100px";
    header.color = "white";
    header.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    header.fontSize = "120"
    panel.addControl(header); 
    var picker = new GUI.ColorPicker();
    picker.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    picker.height = "350px";
    picker.width = "350px";
    picker.onValueChangedObservable.add(function(value) {
        pickedColor = value;
    });
    panel.addControl(picker);

    xrHelper.input.onControllerAddedObservable.add((inputSource)=>{
        inputSource.onMotionControllerInitObservable.add((controller)=>{
            const mainTriggerComponent = controller.getComponent("xr-standard-trigger");
            mainTriggerComponent.onButtonStateChangedObservable.add((component) => {
                if(component.value > 0.9 && component.pressed) {
                    if(controller.rootMesh === undefined){
                        return;
                    }
                    // トリガーが引かれたら球体を生成して発射する
                    // 球体生成
                    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere"+(new Date().getTime()), {diameter:0.1}, scene);
                    sphere.position = controller.rootMesh.getAbsolutePosition();
                    var material = new BABYLON.StandardMaterial("material"+(new Date().getTime()), scene);
                    if(pickedColor !== null){
                        material.diffuseColor = pickedColor;
                        material.specularColor = pickedColor;
                        material.emissiveColor = pickedColor;
                        material.ambientColor = pickedColor;
                        sphere.material = material;
                    }
                    // 球体に物理エンジン適用
                    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 5 }, scene);
                    // 発射準備
                    // コントローラーとおなじ方向に発射したい
                    let ray: BABYLON.Ray = new BABYLON.Ray(new BABYLON.Vector3(), new BABYLON.Vector3());
                    inputSource.getWorldPointerRayToRef(ray, true);
                    var forceDirection = new BABYLON.Vector3(ray.direction.x, ray.direction.y-0.5, ray.direction.z);
                    var forceMagnitude = 30;
                    // 発射
                    sphere.physicsImpostor.applyImpulse(forceDirection.scale(forceMagnitude), sphere.getAbsolutePosition());
                    physicsRoot.addChild(sphere);
                }
            })
        });}
    );


    // コントローラーで他のオブジェクトを殴りたいけどできていない
    /*
    var rightSphere = BABYLON.MeshBuilder.CreateSphere("sphere-right", {diameter:1}, scene);
    rightSphere.physicsImpostor = new BABYLON.PhysicsImpostor(rightSphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 5 }, scene);
    physicsRoot.addChild(rightSphere)

    var leftSphere = BABYLON.MeshBuilder.CreateSphere("sphere-left", {diameter:1}, scene);
    leftSphere.physicsImpostor = new BABYLON.PhysicsImpostor(leftSphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 5 }, scene);
    physicsRoot.addChild(leftSphere)

    xrHelper.input.onControllerAddedObservable.add((inputSource)=>{
        inputSource.onMotionControllerInitObservable.add((controller)=>{
            if(controller.handness === "right"){
                controller.rootMesh = rightSphere;
            }else{
                controller.rootMesh = leftSphere;
            }
        });
    });
    */

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