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

  add<Id extends string, ResourceType extends AnyClass>(args: { id: Id, type: ResourceType, config: (args: ResourceV2CallbackArgs<Outputs>) => ConstructorParameters<ResourceType>[2] })
    : TerrakitController<Configs & Record<Id, ConstructorParameters<ResourceType>[2]>, Outputs & Record<Id, InstanceType<ResourceType>>>;

  add<Id extends string, ResourceType extends AnyClass>(args: { id: Id, type: ResourceType, config: (args: ResourceV2CallbackArgs<Outputs>) => ConstructorParameters<ResourceType>[2], if: boolean })
    : TerrakitController<Configs & Record<Id, ConstructorParameters<ResourceType>[2]>, Outputs & Partial<Record<Id, InstanceType<ResourceType>>>>;

  /**
   * Add a resource to the controller
   */
  add<Id extends string, ResourceType extends AnyClass>(
    args: { id: Id, type: ResourceType, config: (args: ResourceV2CallbackArgs<Outputs>) => ConstructorParameters<ResourceType>[2], if?: boolean }
  ) {
    if (args.if === true || args.if === undefined) {
      this._resources[args.id] = (args1: ResourceV2CallbackArgs<Outputs>) => {
        return new args.type(this.scope, args.id, args.config(args1));
      }
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