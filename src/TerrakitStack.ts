import { App, TerraformStack, TerraformProvider } from "cdktf";
import { Construct } from "constructs";

export interface TerrakitOptions<Identifier extends object> {
  identifier?: Identifier;
  /**
   * The providers to use in this stack.
   * 
   * @default - If not provided, the stack will use the default providers.
   */
  providers?: Record<string, TerraformProvider>;
}

export class TerrakitStack<Identifier extends object> extends TerraformStack {
  constructor(scope: Construct, id: string, options: TerrakitOptions<Identifier>) {
    super(scope, id);
  }

}
