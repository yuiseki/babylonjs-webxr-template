import { Ray, Vector3 } from '@babylonjs/core';
import { WebXRProfiledMotionController } from "@babylonjs/core";
import { WebXRInputSource } from "@babylonjs/core";

export default abstract class AbstractOculusQuestController{
  xrHelper: any;
  rightInputSource: WebXRInputSource;
  leftInputSource: WebXRInputSource;
  rightController: WebXRProfiledMotionController;
  leftController: WebXRProfiledMotionController;

  constructor(xrHelper){
    this.xrHelper = xrHelper;
    xrHelper.input.onControllerAddedObservable.add((inputSource:WebXRInputSource) => {
      inputSource.onMotionControllerInitObservable.add((controller: WebXRProfiledMotionController) => {
        if(controller.handness === "right"){
          this.rightInputSource = inputSource;
          this.rightController = controller;
          // 右手にしかないボタン
          const aButtonComponent = controller.getComponent("a-button");
          aButtonComponent.onButtonStateChangedObservable.add((component) => {
            if(component.value > 0.8 && component.pressed) {
              this.onAButtonPressed(controller, component);
            }
          });
          const bButtonComponent = controller.getComponent("b-button");
          bButtonComponent.onButtonStateChangedObservable.add((component) => {
            if(component.value > 0.8 && component.pressed) {
              this.onBButtonPressed(controller, component)
            }
          });
        }else{
          this.leftInputSource = inputSource;
          this.leftController = controller;
          // 左手にしかないボタン
          const xButtonComponent = controller.getComponent("x-button");
          xButtonComponent.onButtonStateChangedObservable.add((component) => {
            if(component.value > 0.8 && component.pressed) {
              this.onXButtonPressed(controller, component)
            }
          });
          const yButtonComponent = controller.getComponent("y-button");
          yButtonComponent.onButtonStateChangedObservable.add((component) => {
            if(component.value > 0.8 && component.pressed) {
              this.onYButtonPressed(controller, component)
            }
          });
        }
        // 両手にあるボタン
        const mainTriggerComponent = controller.getComponent("xr-standard-trigger");
        mainTriggerComponent.onButtonStateChangedObservable.add((component) => {
          if(component.value > 0.8 && component.pressed) {
            this.onAnyTriggered(controller, component)
            if(controller.handness === "right"){
              this.onRightTriggered(controller, component)
            }else{
              this.onLeftTriggered(controller, component)
            }
          }
        });
        const squeezeComponent = controller.getComponent("xr-standard-squeeze");
        squeezeComponent.onButtonStateChangedObservable.add((component) => {
          if(component.value > 0.8 && component.pressed) {
            this.onAnySqueezed(controller, component)
            if(controller.handness === "right"){
              this.onRightSqueezed(controller, component)
            }else{
              this.onLeftSqueezed(controller, component)
            }
          }
        });
        const thumbStickComponent = controller.getComponent("xr-standard-thumbstick");
        thumbStickComponent.onButtonStateChangedObservable.add((component) => {
          if(component.value > 0.8 && component.pressed) {
            this.onAnyThumbStickPressed(controller, component)
            if(controller.handness === "right"){
              this.onRightThumbStickPressed(controller, component)
            }else{
              this.onLeftThumbStickPressed(controller, component)
            }
          }
        });
      });
    });
  }

  /**
   * Aボタンが押されたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onAButtonPressed(controller, component)
  /**
   * Bボタンが押されたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onBButtonPressed(controller, component)

  /**
   * Xボタンが押されたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onXButtonPressed(controller, component)
  /**
   * Yボタンが押されたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onYButtonPressed(controller, component)

  /**
   * 左右どちらかのトリガーが引かれたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onAnyTriggered(controller, component)
  /**
   * 右コントローラーのトリガーが引かれたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onRightTriggered(controller, component)
  /**
   * 左コントローラーのトリガーが引かれたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onLeftTriggered(controller, component)

  /**
   * 左右どちらかの中指の絞りボタンが押されたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onAnySqueezed(controller, component)
  /**
   * 右コントローラーの絞りボタンが押されたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onRightSqueezed(controller, component)
  /**
   * 左コントローラーの絞りボタンが押されたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onLeftSqueezed(controller, component)

  /**
   * 左右どちらかのサムスティックが押されたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onAnyThumbStickPressed(controller, component)
  /**
   * 右コントローラーのサムスティックが押されたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onRightThumbStickPressed(controller, component)
  /**
   * 左コントローラーのサムスティックが押されたときの処理を実装する
   * @param controller 
   * @param component 
   */
  abstract onLeftThumbStickPressed(controller, component)

  /**
   * 指定されたコントローラーの絶対位置を得る
   * @param controller 右または左コントローラー
   * @returns BABYLON.Vector3
   */
  getControllerPosition(controller){
    if(controller.rootMesh === undefined){
      return new Vector3(0, 0, 0);
    }
    return controller.rootMesh.absolutePosition;
  }

  /**
   * 指定されたコントローラーの絶対方向を得る
   * @param controller 右または左コントローラー
   * @returns BABYLON.Vector3
   */
  getControllerDirection(controller){
    let ray: Ray = new Ray(new Vector3(), new Vector3());
    if(controller.handness === "right"){
      this.rightInputSource.getWorldPointerRayToRef(ray, true);
    }else{
      this.leftInputSource.getWorldPointerRayToRef(ray, true);
    }
    return ray.direction;
  }

  /**
   * 指定されたコントローラーが指しているオブジェクトを得る
   * @param controller 右または左コントローラー
   * @returns BABYLON.Mesh
   */
  getMeshUnderControllerPointer(controller){
    if(controller.handness === "right"){
      return this.xrHelper.pointerSelection.getMeshUnderPointer(this.rightInputSource.uniqueId);
    }else {
      return this.xrHelper.pointerSelection.getMeshUnderPointer(this.leftInputSource.uniqueId);
    }
  }

  /**
   * 右コントローラーの絶対位置を得る
   * @returns BABYLON.Vector3
   */
  getRightControllerPosition(){
    return this.getControllerPosition(this.rightController);
  }

  /**
   * 右コントローラーの絶対方向を得る
   * @returns BABYLON.Vector3
   */
  getRightControllerDirection(){
    return this.getControllerDirection(this.rightController);
  }

  /**
   * 右コントローラーが指しているオブジェクトを得る
   * @returns BABYLON.Mesh
   */
  getMeshUnderRightControllerPointer(){
    return this.getMeshUnderControllerPointer(this.rightController);
  }

  /**
   * 左コントローラーの絶対位置を得る
   * @returns BABYLON.Vector3
   */
  getLeftControllerPosition(){
    return this.getControllerPosition(this.leftController);
  }

  /**
   * 左コントローラーの絶対方向を得る
   * @returns BABYLON.Vector3
   */
  getLeftControllerDirection(){
    return this.getControllerDirection(this.leftController);
  }

  /**
   * 左コントローラーが指しているオブジェクトを得る
   * @returns BABYLON.Mesh
   */
  getMeshUnderLeftContollerPointer(){
    return this.getMeshUnderControllerPointer(this.leftController);
  }
}