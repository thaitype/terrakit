import { type CallbackProvider, type ComposerFactoryFn, Terrakit, BlockComposer, type TerrakitOptions, TerrakitStack, type TerrakitStackConfig } from "terrakit";
import { Construct } from "constructs";
import { StorageAccount } from '@cdktf/provider-azurerm/lib/storage-account/index.js';

export interface StorageAccountStackConfig {
  inputs: {
    resourceGroupName: string;
  };
  providers: {
    defaultAzureProvider: CallbackProvider;
  };
}

export const defineResources = (stack: TerrakitStack<StorageAccountStackConfig>) => {
  return stack.newComposer()
    .addClass({
      id: 'my_storage_account',
      type: StorageAccount,
      config: ({ providers, outputs }) => ({
        provider: providers.defaultAzureProvider,
        name: 'sa' + 'aaa2',
        resourceGroupName: stack.options.inputs.resourceGroupName,
        location: 'eastus',
        accountReplicationType: 'LRS',
        accountTier: 'Standard'
      }),
    })
}

export function createStorageAccountStack(
  scope: Construct,
  stackId: string,
  options: StorageAccountStackConfig,
) {
  const terrakitStack = new TerrakitStack<StorageAccountStackConfig>(scope, stackId, options);
  return new Terrakit(terrakitStack)
    .setComposer(defineResources)
}