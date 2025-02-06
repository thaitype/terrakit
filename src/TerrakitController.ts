import type { TerraformProvider } from 'cdktf';
import type { Construct } from 'constructs';
import merge from 'lodash.merge';
import type { PartialDeep } from 'type-fest';

export type AnyClass = { new (...args: any[]): any };

export type TerrakitResourceConfigs<Type extends AnyClass = AnyClass> = Record<
  string,
  {
    type: Type;
    if?: boolean;
    config: ConstructorParameters<Type>[2];
  }
>;

export interface ResourceCallbackArgs<Outputs extends Record<string, unknown>> {
  id: string;
  providers: Record<string, TerraformProvider>;
  outputs: Outputs;
  scope: Construct;
}

export class TerrakitController<
  ResourceConfigs extends Record<string, unknown> = {},
  Outputs extends Record<string, unknown> = {},
> {
  private _resourceRawConfigs: Record<
    string,
    {
      type: AnyClass;
      config: (args: ResourceCallbackArgs<Record<string, unknown>>) => unknown;
      if?: boolean;
    }
  > = {};
  private _resources: Record<string, unknown> = {};
  private _overrideResourceConfigs: Record<string, unknown> = {};
  private _outputs: Record<string, unknown> = {};

  constructor(
    private scope: Construct,
    private providers: Record<string, TerraformProvider>
  ) {}

  resource<Id extends string, ResourceType extends AnyClass>(args: {
    id: Id;
    type: ResourceType;
    config: (args: ResourceCallbackArgs<Outputs>) => ConstructorParameters<ResourceType>[2];
  }): TerrakitController<
    ResourceConfigs & Record<Id, ConstructorParameters<ResourceType>[2]>,
    Outputs & Record<Id, InstanceType<ResourceType>>
  >;

  resource<Id extends string, ResourceType extends AnyClass>(args: {
    id: Id;
    type: ResourceType;
    config: (args: ResourceCallbackArgs<Outputs>) => ConstructorParameters<ResourceType>[2];
    if: boolean;
  }): TerrakitController<
    ResourceConfigs & Record<Id, ConstructorParameters<ResourceType>[2]>,
    Outputs & Partial<Record<Id, InstanceType<ResourceType>>>
  >;

  /**
   * Add a resource to the controller
   */
  resource<Id extends string, ResourceType extends AnyClass>(args: {
    id: Id;
    type: ResourceType;
    config: (args: ResourceCallbackArgs<Outputs>) => ConstructorParameters<ResourceType>[2];
    if?: boolean;
  }) {
    this._resourceRawConfigs[args.id] = {
      type: args.type,
      config: (args1: ResourceCallbackArgs<Record<string, unknown>>) => args.config(args1 as any),
      if: args.if,
    };
    return this;
  }

  prepareResources() {
    console.log('Preparing resources');
    const resourceCallbacks: Record<string, unknown> = {};
    for (const [id, resourceConfig] of Object.entries(this._resourceRawConfigs)) {
      if (resourceConfig.if === false) {
        continue;
      }
      resourceCallbacks[id] = (args: ResourceCallbackArgs<Outputs>) => {
        let overrides = this._overrideResourceConfigs[id] || {};
        return new resourceConfig.type(args.scope, id, merge({}, resourceConfig.config(args), overrides));
      };
      console.log(`Built resource ${id}`);
    }
    return resourceCallbacks;
  }

  overrideResources(resources: PartialDeep<ResourceConfigs>) {
    this._overrideResourceConfigs = merge({}, this._overrideResourceConfigs, resources);
  }

  build() {
    this._resources = this.prepareResources();

    console.log('Building resources');
    for (const [id, resource] of Object.entries(this._resources)) {
      if (typeof resource !== 'function') {
        throw new Error('The resource must be a function');
      }
      this._outputs[id] = resource({
        id,
        scope: this.scope,
        providers: this.providers,
        outputs: this._outputs,
      });
      console.log(`Built resource ${id}`);
    }
    return this as TerrakitController<ResourceConfigs, Outputs>;
  }

  get outputs() {
    return this._outputs as Outputs;
  }
}
