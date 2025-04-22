import type { TerraformProvider } from 'cdktf';
import type { Construct } from 'constructs';
import type { BlockComposer } from './BlockComposer.js';

export type CallbackProvider = (scope: Construct) => TerraformProvider;

export interface TerrakitStackConfig {
  identifier: object;
  providers: Record<string, CallbackProvider>;
}

export interface TerrakitOptions<Config extends TerrakitStackConfig = TerrakitStackConfig> {
  /**
   * Terraform stack ID, and the `identifier` needs to be provided.
   *
   * @default - A unique stack id will be generated from the identifier.
   */
  id?: string;
  /**
   * The identifier of the stack.
   */
  identifier: Config['identifier'];
  /**
   * The providers to use in this stack.
   *
   * @default - If not provided, the stack will use the default providers.
   */
  providers?: Config['providers'];

  composer?: BlockComposer;
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
