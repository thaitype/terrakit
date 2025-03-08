import type { TerrakitStack } from './TerrakitStack.js';
import type { ExtractController, MergeControllerUnion, TerrakitStackConfig } from './types.js';
import type { TerrakitController } from './TerrakitController.js';
import type { PartialDeep } from 'type-fest';

/**
 * The shape of a generic factory function that
 * returns a TerrakitController for a given stack.
 */
export type ControllerFactoryFn<S extends TerrakitStackConfig> =
  (stack: TerrakitStack<S>) => TerrakitController<any, any>;

export class Terrakit<
  StackConfig extends TerrakitStackConfig,
  Configs extends Record<string, unknown> = {},
  Outputs extends Record<string, unknown> = {},
> {
  public controller: TerrakitController<any> | undefined;

  constructor(public readonly stack: TerrakitStack<StackConfig>) { }

  // setController<Configs extends Record<string, unknown>, Outputs extends Record<string, unknown>>(
  //   callbackController: CallbackController<StackConfig, Configs, Outputs>
  // ) {
  //   console.log('Defining resources');
  //   this.controller = callbackController(this.stack);
  //   return this as unknown as Terrakit<StackConfig, Configs, Outputs>;
  // }

  /**
   * A single function signature that returns
   * a Terrakit with the "merged" type of the returned controller.
   */
  public setController<
    T extends ControllerFactoryFn<StackConfig>,
  >(callbackController: T) {
    console.log('Defining resources');

    // Invoke the provided controller factory function and ensure its return type
    // is correctly transformed using MergeControllerUnion to merge configurations.
    const mergedController = callbackController(this.stack) as MergeControllerUnion<ReturnType<T>>;

    // Store the merged controller instance.
    this.controller = mergedController;

    // Return `this` with updated type parameters that reflect the merged controller’s structure.
    // We extract 'configs' and 'outputs' types using ExtractController<MergeControllerUnion<ReturnType<T>>>.
    return this as Terrakit<
      StackConfig,
      ExtractController<MergeControllerUnion<ReturnType<T>>>['configs'], // Extracts and assigns the new config type
      ExtractController<MergeControllerUnion<ReturnType<T>>>['outputs']  // Extracts and assigns the new outputs type
    >;
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
