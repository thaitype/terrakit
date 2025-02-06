import { App, TerraformStack, TerraformProvider } from "cdktf";
import { Construct } from "constructs";
import { z } from "zod";
import type { TerrakitOptions, TerrakitStackConfig } from "./types.js";
import { TerrakitController } from "./TerrakitController.js";


export class TerrakitStack<Config extends TerrakitStackConfig = TerrakitStackConfig> extends TerraformStack {

  providers!: Record<keyof Config['providers'], TerraformProvider>;
  public controller!: TerrakitController;

  constructor(scope: Construct, public readonly options: TerrakitOptions<Config>) {
    const id = TerrakitStack.generateStackId(options);
    super(scope, id);
    // if (!options) {
    //   throw new Error('The options are required to initialize the TerrakitStack.');
    // }
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
      outputs: controller.outputs
    }
  }

}