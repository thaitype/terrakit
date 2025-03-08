import type { TerraformProvider } from 'cdktf';
import type { Construct } from 'constructs';
import type { TerrakitController } from './TerrakitController.js';

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

  controller?: TerrakitController;
}

// ----------------------------
// Merge Controller Type Utility
// ----------------------------

// class Controller<Configs extends Record<string, unknown> = {}, Outputs extends Record<string, unknown> = {}> { }
// const controller = new Controller<{ name: string; age: number }, { out: string }>();

// **Step 1**: Extracts the inner type `T` from `Controller<T>`, and infer the `Configs` and `Outputs` type
export type ExtractController<T> = {
  configs: T extends TerrakitController<infer U, any> ? U : never;
  outputs: T extends TerrakitController<any, infer U> ? U : never;
}

// **Step 2**: Convert `A | B` into `A & B`
export type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

// **Step 3**: Apply Partial<> and wrap it back into Controller<T>
export type MergeControllerUnion<T> = TerrakitController<
  Partial<UnionToIntersection<ExtractController<T>['configs']>>,
  Partial<UnionToIntersection<ExtractController<T>['outputs']>>
>;

// export type Configs = ExtractController<typeof controller>['configs'];
// export type Outputs = ExtractController<typeof controller>['outputs'];

type OutA = { output: 'A' }
type OutB = { output: 'B' }
type A = { name: string; age: number };
type B = { email: string; active: boolean };

type C1 = TerrakitController<A, OutA>;
type C2 = TerrakitController<B, OutB>;

type Merged = MergeControllerUnion<C1 | C2>;


const mergedConfig: ExtractController<Merged>['configs'] = {
  name: 'John',
  age: 30,
}

// **Expected Output:**
// Controller<{ name?: string; age?: number; email?: string; active?: boolean }>