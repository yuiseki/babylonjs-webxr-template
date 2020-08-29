import {
  Engine,
  Scene,
  HemisphericLight,
  Vector3,
  Color3,
  ArcRotateCamera,
  MeshBuilder,
  StandardMaterial
} from '@babylonjs/core';


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
  environment.setMainColor(Color3.FromHexString("#74b9ff"));

  return scene;
};

const createInochiNoKagayaki = (scene, center: Vector3) => {
  var points = [];
  for (var t = 1; t < 15; t++) {
    var x = Math.sin(t)+center.x; // -左 +右
    var y = Math.cos(t)+center.y; // -下 +上
    var z = center.z; // -後 +前
    var point = new Vector3(x, y, z);
    console.log(point);
    points.push(point);
  }

  var redMaterial = new StandardMaterial("redMaterial", scene);
  redMaterial.diffuseColor = new Color3(255, 0, 0);
  redMaterial.specularColor = new Color3(255, 0, 0);
  redMaterial.emissiveColor = new Color3(255, 0, 0);
  redMaterial.ambientColor = new Color3(255, 0, 0);

  var whiteMaterial = new StandardMaterial("whiteMaterial", scene);
  whiteMaterial.diffuseColor = new Color3(255, 255, 255);
  whiteMaterial.specularColor = new Color3(255, 255, 255);
  whiteMaterial.emissiveColor = new Color3(255, 255, 255);
  whiteMaterial.ambientColor = new Color3(255, 255, 255);

  var blueMaterial = new StandardMaterial("blueMaterial", scene);
  blueMaterial.diffuseColor = new Color3(0, 0, 255);
  blueMaterial.specularColor = new Color3(0, 0, 255);
  blueMaterial.emissiveColor = new Color3(0, 0, 255);
  blueMaterial.ambientColor = new Color3(0, 0, 255);

  points.map((p)=>{
    const diameter = Math.random() * (0.8 - 0.6) + 0.6;
    var redSphere = MeshBuilder.CreateSphere("redSphere_"+(new Date().getTime()), {diameter:diameter}, scene);
    redSphere.material = redMaterial;
    redSphere.position.x = p.x;
    redSphere.position.y = p.y;
    redSphere.position.z = p.z;
    console.log(diameter)
    if(diameter > 0.75){
      var whiteSphere = MeshBuilder.CreateSphere("whiteSphere_"+(new Date().getTime()), {diameter:diameter-0.3}, scene);
      whiteSphere.material = whiteMaterial;
      whiteSphere.position.x = p.x;
      whiteSphere.position.y = p.y;
      whiteSphere.position.z = redSphere.position.z-(diameter/3);

      var blueSphere = MeshBuilder.CreateSphere("blueSphere_"+(new Date().getTime()), {diameter:diameter-0.6}, scene);
      blueSphere.material = blueMaterial;
      blueSphere.position.x = p.x;
      blueSphere.position.y = p.y;
      blueSphere.position.z = whiteSphere.position.z-((diameter-0.2)/2);
    }
  })
}

const createRandomVector3 = () => {
  // x, y, z の float をランダムに得る
  const x = (Math.round(Math.random())*2-1)*Math.random()*1;
  const y = Math.random()*2;
  const z = Math.random()*3;
  return new Vector3(x, y, z);
}

const render = (scene, frame) => {
  if(frame%60===0){
    const center = createRandomVector3();
    createInochiNoKagayaki(scene, center);
  }
}

(async () => {
  try {
    var engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    var scene = await createScene(engine);
    var frame = 0;
    engine.runRenderLoop(function () {
      if (scene) {
        scene.render();
        frame++;
        render(scene, frame);
      }
    });
    window.addEventListener("resize", function () {
      engine.resize();
    });
  } catch (err) {
    console.error(err);
  }
})();
