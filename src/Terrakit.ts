import type { Construct } from "constructs";
import type { TerrakitStack } from "./TerrakitStack.js";
import type { TerrakitStackConfig } from "./types.js";
import type { TerrakitController } from "./TerrakitController.js";

export class Terrakit<Config extends TerrakitStackConfig> {
  constructor(public readonly stack: TerrakitStack<Config>) {
  }

  setController<T extends Record<string, unknown>>(callbackController: (scope: Construct, stack: TerrakitStack<Config>) => TerrakitController<T>) {
    console.log('Defining resources');
    callbackController(this.stack.scope, this.stack);
    return this;
  }

  overrideResources(arg: any) {
    return this;
  }

  build() { }
}