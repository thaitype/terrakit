import { TerraformProvider, TerraformResource } from "cdktf";
import { Construct } from "constructs";

type AnyClass = { new(...args: any[]): any; };

export interface ResourceCallbackArgs<Outputs extends Record<string, unknown>> {
  id: string;
  providers: Record<string, TerraformProvider>;
  outputs: Outputs;
  scope: Construct;
}

export interface ResourceV2CallbackArgs<Outputs extends Record<string, unknown>> {
  id: string;
  providers: Record<string, TerraformProvider>;
  outputs: Outputs;
  scope: Construct;
}

export class TerrakitController<Configs extends Record<string, unknown> = {}, Outputs extends Record<string, unknown> = {}> {

  private _resources: Record<string, unknown> = {};
  private _outputs: Record<string, unknown> = {};

  constructor(private scope: Construct, private providers: Record<string, TerraformProvider>) { }


  resource<Id extends string, Return>(args: { id: Id, resource: (args: ResourceCallbackArgs<Outputs>) => Return })
    : TerrakitController<Configs, Outputs & Record<Id, Return>>;

  resource<Id extends string, Return>(args: { id: Id, resource: (args: ResourceCallbackArgs<Outputs>) => Return, if: boolean })
    : TerrakitController<Configs, Outputs & Partial<Record<Id, Return>>>;

  /**
   * Add a resource to the controller
   */
  resource<Id extends string, Return>(
    args: { id: Id, resource: (args: ResourceCallbackArgs<Outputs>) => Return, if?: boolean, }
  ) {
    if (args.if === true || args.if === undefined) {
      this._resources[args.id] = args.resource;
    }
    return this as TerrakitController<Configs, Outputs & Record<Id, Return>>;
  }


  // resourceV2<Id extends string, Return>(args: { id: Id, resource: (args: ResourceCallbackArgs<Resources>) => Return })
  //   : TerrakitController<Resources & Record<Id, Return>>;

  // resourceV2<Id extends string, Return>(args: { id: Id, resource: (args: ResourceCallbackArgs<Resources>) => Return, if: boolean })
  //   : TerrakitController<Resources & Partial<Record<Id, Return>>>;

  /**
   * Add a resource to the controller
   */
  resourceV2<Id extends string, ResourceType extends AnyClass>(
    args: { id: Id, type: ResourceType, config: (args: ResourceV2CallbackArgs<Outputs>) => ConstructorParameters<ResourceType>[2], if?: boolean }
  ) {
    if(!(args.type instanceof TerraformResource)) {
      throw new Error('The type must be a TerraformResource');
    }
    return this as TerrakitController<Configs & Record<Id, ConstructorParameters<ResourceType>[2]>, Outputs & Record<Id, InstanceType<ResourceType>>>;
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
    return this as TerrakitController<Configs, Outputs>;
  }

  get outputs() {
    return this._outputs as Outputs;
  }
}