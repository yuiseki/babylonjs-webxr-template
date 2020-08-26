import * as BABYLON from '@babylonjs/core';
import { WebXRProfiledMotionController } from "@babylonjs/core";
import { WebXRInputSource } from "@babylonjs/core";

export default abstract class AbstractOculusQuestController{
  rightInputSource: WebXRInputSource;
  leftInputSource: WebXRInputSource;
  rightController: WebXRProfiledMotionController;
  leftController: WebXRProfiledMotionController;

  constructor(xrHelper){
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

  abstract onAButtonPressed(controller, component)
  abstract onBButtonPressed(controller, component)

  abstract onXButtonPressed(controller, component)
  abstract onYButtonPressed(controller, component)

  abstract onAnyTriggered(controller, component)
  abstract onRightTriggered(controller, component)
  abstract onLeftTriggered(controller, component)

  abstract onAnySqueezed(controller, component)
  abstract onRightSqueezed(controller, component)
  abstract onLeftSqueezed(controller, component)

  abstract onAnyThumbStickPressed(controller, component)
  abstract onRightThumbStickPressed(controller, component)
  abstract onLeftThumbStickPressed(controller, component)

  getControllerPosition(controller){
    if(controller.rootMesh === undefined){
      return new BABYLON.Vector3(0, 0, 0);
    }
    return controller.rootMesh.absolutePosition;
  }

  getControllerDirection(controller){
    let ray: BABYLON.Ray = new BABYLON.Ray(new BABYLON.Vector3(), new BABYLON.Vector3());
    if(controller.handness === "right"){
      this.rightInputSource.getWorldPointerRayToRef(ray, true);
    }else{
      this.leftInputSource.getWorldPointerRayToRef(ray, true);
    }
    return ray.direction;
  }

  getRightControllerPosition(){
    return this.getControllerPosition(this.rightController);
  }

  getRightControllerDirection(){
    return this.getControllerDirection(this.rightController)
  }

  getLeftControllerPosition(){
    return this.getControllerPosition(this.leftController);
  }

  getLeftControllerDirection(){
    return this.getControllerDirection(this.leftController)
  }
}