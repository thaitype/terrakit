import { TerraformProvider } from "cdktf";
import { Construct } from "constructs";

export interface ResourceCallbackArgs<Outputs extends Record<string, unknown>> {
  id: string;
  providers: Record<string, TerraformProvider>;
  outputs: Outputs;
  scope: Construct;
}

export class TerrakitController<Resources extends Record<string, unknown> = {}> {

  private _resources: Record<string, unknown> = {};
  private _outputs: Record<string, unknown> = {};

  constructor(private scope: Construct, private providers: Record<string, TerraformProvider>) { }


  resource<Id extends string, Return>(args: { id: Id, resource: (args: ResourceCallbackArgs<Resources>) => Return })
    : TerrakitController<Resources & Record<Id, Return>>;

  resource<Id extends string, Return>(args: { id: Id, resource: (args: ResourceCallbackArgs<Resources>) => Return, if: boolean })
    : TerrakitController<Resources & Partial<Record<Id, Return>>>;

  /**
   * Add a resource to the controller
   */
  resource<Id extends string, Return>(
    args: { id: Id, resource: (args: ResourceCallbackArgs<Resources>) => Return, if?: boolean, }
  ) {
    if (args.if === true || args.if === undefined) {
      this._resources[args.id] = args.resource;
    }
    return this as TerrakitController<Resources & Record<Id, Return>>;
  }

  build() {
    console.log('Building resources');
    for (const [id, resource] of Object.entries(this._resources)) {
      if (typeof resource !== 'function') {
        throw new Error('The resource must be a function');
      }
      this._outputs[id] = resource({
        id,
        scope: this.scope,
        providers: this.providers,
        outputs: this._outputs
      });
      console.log(`Built resource ${id}`);
    }
    return this as TerrakitController<Resources>;
  }

  get outputs() {
    return this._outputs as Resources;
  }
}