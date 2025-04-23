import type { TerrakitStack } from './TerrakitStack.js';
import type { ExtractComposer, MergeComposerUnion, TerrakitStackConfig } from './types.js';
import type { BlockComposer } from './BlockComposer.js';
import type { PartialDeep } from 'type-fest';

/**
 * The shape of a generic factory function that
 * returns a BlockComposer for a given stack.
 */
export type ComposerFactoryFn<S extends TerrakitStackConfig> = (stack: TerrakitStack<S>) => BlockComposer<any, any>;

export class Terrakit<
  StackConfig extends TerrakitStackConfig,
  Configs extends Record<string, unknown> = {},
  Outputs extends Record<string, unknown> = {},
> {
  public composer!: BlockComposer<Configs, Outputs>;

  constructor(public readonly stack: TerrakitStack<StackConfig>) {}

  /**
   * A single function signature that returns
   * a Terrakit with the "merged" type of the returned composer.
   */
  public setComposer<T extends ComposerFactoryFn<StackConfig>>(callbackComposer: T) {
    console.log('Defining resources');

    // Invoke the provided composer factory function and ensure its return type
    // is correctly transformed using MergeComposerUnion to merge configurations.
    const mergedComposer = callbackComposer(this.stack) as MergeComposerUnion<ReturnType<T>>;

    // Store the merged composer instance.
    this.composer = mergedComposer as unknown as BlockComposer<Configs, Outputs>;

    // Return `this` with updated type parameters that reflect the merged composer’s structure.
    // We extract 'configs' and 'outputs' types using ExtractComposer<MergeComposerUnion<ReturnType<T>>>.
    return this as unknown as Terrakit<
      StackConfig,
      ExtractComposer<MergeComposerUnion<ReturnType<T>>>['configs'], // Extracts and assigns the new config type
      ExtractComposer<MergeComposerUnion<ReturnType<T>>>['outputs'] // Extracts and assigns the new outputs type
    >;
  }

  override(arg: PartialDeep<Configs>) {
    if (!this.composer) {
      throw new Error('Composer not defined, call setComposer first');
    }
    this.composer.override(arg);
    return this;
  }

  build() {
    if (!this.composer) {
      throw new Error('Composer not defined');
    }
    console.log('Building resources');
    return this.composer.build();
  }
}
