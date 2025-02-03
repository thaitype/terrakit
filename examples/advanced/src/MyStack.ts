import { App } from "cdktf";
import { type TerrakitOptions, TerrakitStack } from "terrakit";
import { Construct } from "constructs";

export interface MyIdentifier {
  env: 'prod';
  slot: 'prod' | 'staging';
  site: 'active' | 'dr';
}

export class MyStack extends TerrakitStack<MyIdentifier> {
  constructor(scope: Construct, options: TerrakitOptions<MyIdentifier>) {
    super(scope, options);
  }
}

