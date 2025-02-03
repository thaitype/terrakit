import { App, TerraformStack, TerraformProvider } from "cdktf";
import { Construct } from "constructs";
import { z } from "zod";

export interface TerrakitOptions<Identifier extends object = {}> {
  /**
   * Terraform stack ID, and the `identifier` needs to be provided.
   * 
   * @default - A unique stack id will be generated from the identifier.
   */
  id?: string;
  /**
   * The identifier of the stack.
   */
  identifier?: Identifier;
  /**
   * The providers to use in this stack.
   * 
   * @default - If not provided, the stack will use the default providers.
   */
  providers?: Record<string, TerraformProvider>;
}

export class TerrakitStack<Identifier extends object = {}> extends TerraformStack {
  constructor(scope: Construct, options?: TerrakitOptions<Identifier>) {
    const id = TerrakitStack.generateStackId(options);
    super(scope, id);
  }

  static generateStackId<Identifier extends object>(options?: TerrakitOptions<Identifier>): string {
    if (options && options.id) {
      return options.id;
    }
    if (!options || !options.identifier) {
      throw new Error('The identifier is required to generate the stack id.');
    }
    const identifier = z.record(z.string()).parse(options.identifier);
    if(Object.keys(identifier).length === 0) {
      throw new Error('The identifier must not be empty.');
    }
    return Object.entries(identifier).map(([key, value]) => `${key}_${value}`).join('-');
  }

}