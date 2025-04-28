import type { TerraformProvider } from 'cdktf';
import type { Construct } from 'constructs';
import type { BlockComposer } from './BlockComposer.js';

export type CallbackProvider = (scope: Construct) => TerraformProvider;
/**
 * Defines the shape of a stack configuration in Terrakit.
 */
export interface TerrakitStackConfig {
  /**
   * External input values provided to this stack.
   * These are user-defined parameters or values passed from other stacks.
   * Typically used to configure environment, feature flags, shared resource references, etc.
   *
   * Example:
   * ```ts
   * vars: {
   *   env: 'prod',
   *   site: 'active',
   *   sharedResourceGroupName: 'rg-shared'
   * }
   * ```
   */
  vars: object;

  /**
   * A map of named provider callbacks, used to initialize providers for this stack.
   * Keys represent provider aliases.
   *
   * Example:
   * ```ts
   * providers: {
   *   defaultAzureProvider: (scope) => new AzurermProvider(scope, 'default', { ... })
   * }
   * ```
   */
  providers: Record<string, CallbackProvider>;
}

/**
 * Options used to initialize a Terrakit stack instance.
 */
export interface TerrakitOptions<Config extends TerrakitStackConfig = TerrakitStackConfig> {
  /**
   * Values passed into the stack from the outside.
   * Can include environment identifiers, feature flags, shared values, or cross-stack inputs.
   */
  vars: Config['vars'];

  /**
   * The providers to use in this stack.
   *
   * @default - If not provided, the stack will use the default providers.
   */
  providers?: Config['providers'];

  /**
   * Optional composer override used to manually supply a custom BlockComposer instance.
   */
  // composer?: BlockComposer;
}

// ----------------------------
// Merge Composer Type Utility
// ----------------------------

// **Step 1**: Extracts the inner type `T` from `Composer<T>`, and infer the `Configs` and `Outputs` type
export type ExtractComposer<T> = {
  configs: T extends BlockComposer<infer U, any> ? U : never;
  outputs: T extends BlockComposer<any, infer U> ? U : never;
};

// **Step 2**: Convert `A | B` into `A & B`
export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

// **Step 3**: Apply Partial<> and wrap it back into Composer<T>
export type MergeComposerUnion<T> = BlockComposer<
  Partial<UnionToIntersection<ExtractComposer<T>['configs']>>,
  Partial<UnionToIntersection<ExtractComposer<T>['outputs']>>
>;
