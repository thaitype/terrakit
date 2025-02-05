import { App, TerraformStack, TerraformProvider } from "cdktf";
import { Construct } from "constructs";
import { z } from "zod";
import type { TerrakitOptions, TerrakitStackConfig } from "./types.js";

export type ResourceArgs<Outputs extends Record<string, any>> = {
  id: string;
  providers: Record<string, TerraformProvider>;
  outputs: Outputs;
  scope: Construct;
}

export class TerrakitController<Resources extends Record<string, any> = {}> {

  private resources: Record<string, any> = {};
  private outputs: Record<string, any> = {};

  constructor(private scope: Construct, private providers: Record<string, TerraformProvider>) {}

  resource<Id extends string, Return>(id: Id, resource: (args: ResourceArgs<Resources>) => Return): TerrakitController<Resources & Record<Id, Return>>;
  resource<Id extends string, Return>(id: Id, condition: boolean, resource: (args: ResourceArgs<Resources>) => Return): TerrakitController<Resources & Partial<Record<Id, Return>>>;

  /**
   * Add a resource to the controller
   */
  resource<Id extends string, Return>(
    id: Id,
    resourceOrCondition: boolean | ((args: ResourceArgs<Resources>) => Return),
    maybeResource?: (args: ResourceArgs<Resources>) => Return
  ) {
    // this.resources[id] = resource;
    // TODO: 
    return this as TerrakitController<Resources & Record<Id, Return>>;
  }

  resourceV2<Id extends string, Return>(args: { id: Id, resource: (args: ResourceArgs<Resources>) => Return }): TerrakitController<Resources & Record<Id, Return>>;
  resourceV2<Id extends string, Return>(args: { id: Id, if: boolean, resource: (args: ResourceArgs<Resources>) => Return }): TerrakitController<Resources & Partial<Record<Id, Return>>>;

  /**
   * Add a resource to the controller
   */
  resourceV2<Id extends string, Return>(
    args: { id: Id, resource: (args: ResourceArgs<Resources>) => Return } | { id: Id, if: boolean, resource: (args: ResourceArgs<Resources>) => Return }
  ) {
    // TODO: 
    return this as TerrakitController<Resources & Record<Id, Return>>;
  }

  build() {
    console.log('Building resources');
    for (const [id, resource] of Object.entries(this.resources)) {
      this.outputs[id] = resource({
        id,
        scope: this.scope,
        providers: this.providers,
        outputs: this.outputs
      });
      console.log(`Built resource ${id}`);
    }
    return this as TerrakitController<Resources>;
  }

  getOutput() {
    return this.outputs as Resources;
  }
}

export class TerrakitStack<Config extends TerrakitStackConfig = TerrakitStackConfig> extends TerraformStack {

  providers!: Record<keyof Config['providers'], TerraformProvider>;
  public controller!: TerrakitController;

  constructor(scope: Construct, options?: TerrakitOptions<Config>) {
    const id = TerrakitStack.generateStackId(options);
    super(scope, id);

    if (!options) {
      throw new Error('The options are required to initialize the TerrakitStack.');
    }
    if (options.controller) {
      console.log('Initialized controller at TerrakitStack');
      options.controller.build();
      this.controller = options.controller;

    } else if (options.providers) {
      this.providers = TerrakitStack.setupProviders(this, options) as Record<keyof Config['providers'], TerraformProvider>;
      console.log('Initialized providers at TerrakitStack');
      this.controller = new TerrakitController(scope, this.providers);
    }
  }

  static generateStackId<Config extends TerrakitStackConfig>(options?: TerrakitOptions<Config>): string {
    if (options && options.id) {
      return options.id;
    }
    if (!options || !options.identifier) {
      throw new Error('The identifier is required to generate the stack id.');
    }
    const identifier = z.record(z.string()).parse(options.identifier);
    if (Object.keys(identifier).length === 0) {
      throw new Error('The identifier must not be empty.');
    }
    return Object.entries(identifier).map(([key, value]) => `${key}_${value}`).join('-');
  }


  static setupProviders(scope: Construct, options: TerrakitOptions) {
    const providers: Record<string, any> = {}
    for (const [key, provider] of Object.entries(options.providers as Record<string, any>)) {
      providers[key] = provider(scope);
    }
    return providers;
  }

  output<T extends Record<string, any> = {}>(controller: TerrakitController<T>) {
    // Attach the controller to the stack
    this.controller = controller;
    return {
      stack: this,
      outputs: controller.getOutput()
    }
  }

}