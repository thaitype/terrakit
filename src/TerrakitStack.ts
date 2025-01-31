import { App, TerraformStack } from "cdktf";
import { Construct } from "constructs";

export interface TerrakitOptions<Identifier extends object> {
  identifier: Identifier;
}

export class TerrakitStack<Identifier extends object> extends TerraformStack {
  constructor(scope: Construct, id: string, options: TerrakitOptions<Identifier>) {
    super(scope, id);
  }

}
