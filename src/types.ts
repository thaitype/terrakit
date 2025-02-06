import type { TerraformProvider } from 'cdktf';
import type { Construct } from 'constructs';
import type { TerrakitController } from './TerrakitController.js';

export type BaseProviders = Record<string, TerraformProvider>;

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
