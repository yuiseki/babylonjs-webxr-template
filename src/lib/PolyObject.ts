import { SceneLoader, AbstractMesh } from '@babylonjs/core';

export default class PolyObject {
  static API_ENDPOINT = "https://poly.googleapis.com/v1/assets/"
  static API_KEY = "AIzaSyBu5r05N4bLwcpncHhDfmnfeJXJZWpUlps";
  scene: any;
  polyId: string;
  ready: Promise<any>;
  assetsUrl: string;
  asset: any;
  gltf: any;
  gltfFileName: string;
  gltfRootUrl: string;
  meshes: AbstractMesh[];


  constructor(scene, polyId: string){
    this.scene = scene;
    this.polyId = polyId;
    this.ready = new Promise(async(resolve, reject)=>{
      await this.getAsset()
      this.load();
      resolve();
    });
  }

  getAssetUrl(){
    return PolyObject.API_ENDPOINT+this.polyId+'/?key='+PolyObject.API_KEY;
  }

  async getAsset(){
    this.assetsUrl = this.getAssetUrl();
    const res = await fetch(this.assetsUrl);
    this.asset = await res.json();
    this.gltf = this.asset.formats.filter((f)=>{ return (f.formatType == "GLTF") })[0];
    this.gltfFileName = this.gltf.root.relativePath;
    this.gltfRootUrl = this.gltf.root.url.replace(this.gltfFileName, "");
  }

  load(){
    console.log(this.gltfRootUrl);
    console.log(this.gltfFileName);
    SceneLoader.ImportMesh("", this.gltfRootUrl, this.gltfFileName, this.scene, (meshes) => {
      console.log(meshes);
      this.meshes = meshes;

    });
  }


}