import { AdvancedDynamicTexture, StackPanel, Control, TextBlock } from "@babylonjs/gui";


export default class IncrementalTextBlock{
  lines:string[] = [];
  textBlock: TextBlock;
  
  constructor(scene){
    var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("Logs", true, scene);
    var panel = new StackPanel();
    panel.paddingTop = "25%";
    panel.paddingLeft = "10%";
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    advancedTexture.addControl(panel);
    var textBlock = new TextBlock();
    textBlock.height = "400px";
    textBlock.width = "400px";
    textBlock.color = "lightblue";
    textBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    textBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    textBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    textBlock.fontSize = "10";
    panel.addControl(textBlock);
    this.textBlock = textBlock;
    this.addNewLine("System Logs:");
  }

  addNewLine(newLine:string){
    console.log(newLine);
    if(this.lines.length>15){
      this.lines.shift();
      this.lines.push(newLine);
    }else{
      this.lines.push(newLine);
    }
    this.render()
  }

  render(){
    const text = this.lines.join('\n');
    this.textBlock.text = text;
  }
}