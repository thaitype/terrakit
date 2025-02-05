import type { Construct } from "constructs";
import type { TerrakitStack } from "./TerrakitStack.js";
import type { TerrakitOptions, TerrakitStackConfig } from "./types.js";
import type { TerrakitController } from "./TerrakitController.js";

export class Terrakit<Config extends TerrakitStackConfig, Output = {}> {

  public controller: TerrakitController<any> | undefined;

  constructor(public readonly stack: TerrakitStack<Config>) {
  }

  setController<Configs extends Record<string, unknown>, Outputs extends Record<string, unknown>>(callbackController: (stack: TerrakitStack<Config>) => TerrakitController<Configs, Outputs>) {
    console.log('Defining resources');
    this.controller = callbackController(this.stack);
    return this as Terrakit<Config, Configs>;
  }

  overrideResources(arg: any) {
    return this;
  }

  build() {
    if (!this.controller) {
      throw new Error('Controller not defined');
    }
    console.log('Building resources');
    this.controller.build();
  }
}