import { App } from "cdktf";
import { type BaseProviders, type TerrakitOptions, TerrakitStack } from "terrakit";
import { Construct } from "constructs";
import { ResourceGroup } from '../.gen/providers/azurerm/resource-group/index.js';
import type { AzurermProvider } from "../.gen/providers/azurerm/provider/index.js";
import type { SetRequired } from 'type-fest';

export interface MyIdentifiers {
  env: 'prod';
  slot: 'prod' | 'staging';
  site: 'active' | 'dr';
}

export interface MyProviders {
  defaultAzureProvider: AzurermProvider;
}

export interface TerrakitStackConfig {
  identifier: MyIdentifiers;
  providers: MyProviders;
}

export class MyStack extends TerrakitStack<TerrakitStackConfig> {
  constructor(scope: Construct, public readonly options: SetRequired<TerrakitOptions<TerrakitStackConfig>, 'identifier' | 'providers'>) {
    super(scope, options);
    const resourceGroup = this.resourceGroup();
    console.log(`Resource Group Name: ${resourceGroup.name}`);
  }

  resourceGroup() {
    return new ResourceGroup(this, 'ResourceGroup', {
      provider: this.options.providers.defaultAzureProvider,
      name: 'myResourceGroup',
      location: 'eastus'
    });
  }
}

