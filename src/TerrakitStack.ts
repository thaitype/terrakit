import { App, TerraformStack, TerraformProvider } from "cdktf";
import { Construct } from "constructs";
import { z } from "zod";
import type { TerrakitOptions, TerrakitStackConfig } from "./types.js";

export class ResourceController {

  addResource(name: string, resource: (id: string) => any) {
    resource(name);
    return this;
  }

  getOutput() {
    return {
      mockOutput: 'mockOutput'
    }
  }
}

export class TerrakitStack<Config extends TerrakitStackConfig = TerrakitStackConfig> extends TerraformStack {

  providers!: Record<keyof Config['providers'], TerraformProvider>;
  protected readonly controller: ResourceController = new ResourceController();

  constructor(scope: Construct, options?: TerrakitOptions<Config>) {
    const id = TerrakitStack.generateStackId(options);
    super(scope, id);
    if (options && options.providers) {
      this.setupProviders(options);
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


  setupProviders(options: TerrakitOptions<Config>) {
    if (!this.providers) {
      (this.providers as {}) = {} as Record<string, any>;
    }
    for (const [key, provider] of Object.entries(options.providers as Record<string, any>)) {
      (this.providers as Record<string, any>)[key] = provider(this);
    }
  }

  output() {
    return this.controller.getOutput();
  }

}