import type { TerrakitStack } from './TerrakitStack.js';
import type { TerrakitStackConfig } from './types.js';
import type { TerrakitController } from './TerrakitController.js';
import type { PartialDeep } from 'type-fest';

export class Terrakit<
  StackConfig extends TerrakitStackConfig,
  Configs extends Record<string, unknown> = {},
  Outputs extends Record<string, unknown> = {},
> {
  public controller: TerrakitController<any> | undefined;

  constructor(public readonly stack: TerrakitStack<StackConfig>) {}

  setController<Configs extends Record<string, unknown>, Outputs extends Record<string, unknown>>(
    callbackController: (stack: TerrakitStack<StackConfig>) => TerrakitController<Configs, Outputs>
  ) {
    console.log('Defining resources');
    this.controller = callbackController(this.stack);
    return this as unknown as Terrakit<StackConfig, Configs, Outputs>;
  }

  overrideResources(arg: PartialDeep<Configs>) {
    if (!this.controller) {
      throw new Error('Controller not defined, call setController first');
    }
    this.controller.overrideStack(arg);
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
