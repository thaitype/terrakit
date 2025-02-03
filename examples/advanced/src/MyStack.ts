import { App } from "cdktf";
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

export const createStack = (scope: Construct, options: SetRequired<TerrakitOptions<TerrakitStackConfig>, 'identifier' | 'providers'>) => {
  const stack = new TerrakitStack(scope, options);
  const resourceGroup = new ResourceGroup(stack, 'myResourceGroup', {
    provider: options.providers.defaultAzureProvider(scope),
    name: 'myResourceGroup',
    location: 'eastus'
  });
  return stack;
}

export class MyStack extends TerrakitStack<TerrakitStackConfig> {
  
  constructor(scope: Construct, public readonly options: SetRequired<TerrakitOptions<TerrakitStackConfig>, 'identifier' | 'providers'>) {
    super(scope, options);
    // const provider = new AzurermProvider(this, "AzureRm", {
    // });
    new ResourceGroup(this, 'myResourceGroup', {
      // provider: provider,
      provider: this.options.providers.defaultAzureProvider(this),
      name: 'myResourceGroup-11',
      location: 'eastus'
    });
    // const resourceGroup = this.resourceGroup('myResourceGroup');
    // console.log(`Resource Group Name: ${resourceGroup.name}`);

    // this.controller.addResource('ResourceGroup', (id) => this.resourceGroup(id));
  }

  resourceGroup(id: string) {
    return new ResourceGroup(this, id, {
      provider: this.options.providers.defaultAzureProvider(this),
      name: 'myResourceGroup',
      location: 'eastus'
    });
  }

  
}

