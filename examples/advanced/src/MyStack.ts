import { App, TerraformProvider } from "cdktf";
import { type BaseProviders, type CallbackProvider, type TerrakitOptions, TerrakitStack } from "terrakit";
import { Construct } from "constructs";
import { ResourceGroup } from '../.gen/providers/azurerm/resource-group/index.js';
import { AzurermProvider } from "../.gen/providers/azurerm/provider/index.js";
import type { SetRequired } from 'type-fest';

export interface TerrakitStackConfig {
  identifier: {
    env: 'prod';
    slot: 'prod' | 'staging';
    site: 'active' | 'dr';
  };
  providers: {
    defaultAzureProvider: CallbackProvider;
  };
}

export class MyStack extends TerrakitStack<TerrakitStackConfig> {

  providers!: Record<keyof TerrakitStackConfig['providers'], TerraformProvider>;

  constructor(scope: Construct, public readonly options: SetRequired<TerrakitOptions<TerrakitStackConfig>, 'identifier' | 'providers'>) {
    super(scope, options);
    this.setupProviders();

    this.controller
      .addResource('aaa1', (id) => this.resourceGroup(id))
      .addResource('bbb2', (id) => this.resourceGroup(id))
  }

  resourceGroup(id: string) {
    return new ResourceGroup(this, id, {
      provider: this.providers.defaultAzureProvider,
      name: 'rg-' + id,
      location: 'eastus'
    });
  }

  setupProviders() {
    if(!this.providers) {
      this.providers = {} as Record<string, any>;
    }
    for(const [key, provider] of Object.entries(this.options.providers)) {
      (this.providers as Record<string, any>)[key] = provider(this);
    }
  }


}

