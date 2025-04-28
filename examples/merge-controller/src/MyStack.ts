import { type CallbackProvider, type ComposerFactoryFn, Terrakit, BlockComposer, type TerrakitOptions, TerrakitStack } from "terrakit";
import { Construct } from "constructs";
import { ResourceGroup } from "@cdktf/provider-azurerm/lib/resource-group/index.js";
import { StorageAccount } from "@cdktf/provider-azurerm/lib/storage-account/index.js";

export interface MyTerrakitStackConfig {
  vars: {
    env: 'prod';
    slot: 'prod' | 'staging';
    site: 'active' | 'dr';
  };
  providers: {
    defaultAzureProvider: CallbackProvider;
  };
}

export const createComposer = (stack: TerrakitStack<MyTerrakitStackConfig>) => {
  const resourceGroup = new BlockComposer(stack, stack.providers)
    .addClass({
      id: 'resource_group',
      type: ResourceGroup,
      config: ({ providers }) => ({
        provider: providers.defaultAzureProvider,
        name: 'rg-' + 'aaa1',
        location: 'eastus'
      }),
    })
    .alwaysOptional();


  const storageAccount = new BlockComposer(stack, stack.providers)
    .addClass({
      id: 'storage_account',
      type: StorageAccount,
      config: ({ providers, outputs }) => ({
        provider: providers.defaultAzureProvider,
        name: 'sa' + 'aaa1',
        resourceGroupName: resourceGroup!.outputs.resource_group.name,
        location: 'eastus',
        accountReplicationType: 'LRS',
        accountTier: 'Standard'
      }),
    })

  // return storageAccount; // Error, due to it requires resourceGroup name to be resolved
  // return storageAccount.merge(resourceGroup); Error, due to it requires resourceGroup name to be resolved before merging
  if (!resourceGroup) {
    throw new Error(`ResourceGroup is not defined`);
  }

  if (stack.options.vars.site === 'active') {
    return resourceGroup.merge(storageAccount);
  }
  return resourceGroup;

}

// Functional approach

export function createMyStack(
  scope: Construct,
  stackId: string,
  options: MyTerrakitStackConfig,
) {
  const terrakitStack = new TerrakitStack<MyTerrakitStackConfig>(scope, stackId, options);
  return new Terrakit(terrakitStack)
    .setComposer(createComposer)
}

// Class approach

export class MyStack extends TerrakitStack<MyTerrakitStackConfig> {
  constructor(public scope: Construct, stackId: string, public options: MyTerrakitStackConfig) {
    super(scope, stackId, options);
  }

  configureStack() {
    return new Terrakit(this)
      .setComposer(createComposer)
  }
}
