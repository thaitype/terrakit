import { type CallbackProvider, type ControllerFactoryFn, Terrakit, TerrakitController, type TerrakitOptions, TerrakitStack } from "terrakit";
import { Construct } from "constructs";
import type { SetRequired } from 'type-fest';
import { ResourceGroup } from "@cdktf/provider-azurerm/lib/resource-group/index.js";
import { StorageAccount } from "@cdktf/provider-azurerm/lib/storage-account/index.js";

export interface MyTerrakitStackConfig {
  identifier: {
    env: 'prod';
    slot: 'prod' | 'staging';
    site: 'active' | 'dr';
  };
  providers: {
    defaultAzureProvider: CallbackProvider;
  };
}

export const createController = (stack: TerrakitStack<MyTerrakitStackConfig>) => {
  const resourceGroup = new TerrakitController(stack, stack.providers)
    .add({
      id: 'resource_group',
      type: ResourceGroup,
      config: ({ providers }) => ({
        provider: providers.defaultAzureProvider,
        name: 'rg-' + 'aaa1',
        location: 'eastus'
      }),
    });


  const storageAccount = new TerrakitController(stack, stack.providers)
    .add({
      id: 'storage_account',
      type: StorageAccount,
      config: ({ providers, outputs }) => ({
        provider: providers.defaultAzureProvider,
        name: 'sa' + 'aaa1',
        resourceGroupName: resourceGroup.outputs.resource_group.name,
        location: 'eastus',
        accountReplicationType: 'LRS',
        accountTier: 'Standard'
      }),
    });

  // return storageAccount; // Error, due to it requires resourceGroup name to be resolved
  // return storageAccount.merge(resourceGroup); Error, due to it requires resourceGroup name to be resolved before merging

  if (stack.options.identifier.site === 'active') {
    return resourceGroup.merge(storageAccount);
  }
  return resourceGroup;

}

// Functional approach

export function createMyStack(
  scope: Construct,
  options: SetRequired<TerrakitOptions<MyTerrakitStackConfig>, 'identifier' | 'providers'>
) {
  const terrakitStack = new TerrakitStack<MyTerrakitStackConfig>(scope, options);
  return new Terrakit(terrakitStack)
    .setController(createController)
}

// Class approach

export class MyStack extends TerrakitStack<MyTerrakitStackConfig> {
  constructor(public scope: Construct, public options: SetRequired<TerrakitOptions<MyTerrakitStackConfig>, 'identifier' | 'providers'>) {
    super(scope, options);
  }

  configureStack(){
    return new Terrakit(this)
      .setController(createController)
  }
}
