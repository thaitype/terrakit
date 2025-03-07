import { type CallbackProvider, Terrakit, TerrakitController, type TerrakitOptions, TerrakitStack, type TerrakitStackConfig } from "terrakit";
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

export class MyStackOriginal extends TerrakitStack<MyTerrakitStackConfig> {

  constructor(scope: Construct, public readonly options: SetRequired<TerrakitOptions<MyTerrakitStackConfig>, 'identifier' | 'providers'>) {
    super(scope, options);

    const controller = this.controller
      .add({
        id: 'aaa1',
        type: ResourceGroup,
        config: ({ providers }) => ({
          provider: providers.defaultAzureProvider,
          name: 'rg-' + 'aaa1',
          location: 'eastus'
        }),
      }).build();
  }

}

export const createController = (stack: TerrakitStack<MyTerrakitStackConfig>) => {
  return new TerrakitController(stack, stack.providers)
    .add({
      id: 'aaa1',
      type: ResourceGroup,
      config: ({ providers }) => ({
        provider: providers.defaultAzureProvider,
        name: 'rg-' + 'aaa1',
        location: 'eastus'
      }),
    })
    .add({
      id: 'aaa2',
      type: StorageAccount,
      config: ({ providers, outputs }) => ({
        provider: providers.defaultAzureProvider,
        name: 'sa' + 'aaa2',
        resourceGroupName: outputs.aaa1.name,
        location: 'eastus',
        accountReplicationType: 'LRS',
        accountTier: 'Standard'
      }),
    })
    .add({
      id: 'aaa3',
      if: stack.options.identifier.env === 'prod',
      type: StorageAccount,
      config: ({ providers, outputs }) => ({
        provider: providers.defaultAzureProvider,
        name: 'sa' + 'aaa3',
        resourceGroupName: outputs.aaa2.accessTier,
        location: 'eastus',
        accountReplicationType: 'LRS',
        accountTier: 'Standard'
      }),
    })
    .add({
      id: 'aaa4',
      type: StorageAccount,
      config: ({ providers, outputs }) => ({
        provider: providers.defaultAzureProvider,
        name: 'sa' + 'aaa4',
        resourceGroupName: outputs.aaa3?.name ?? 'default-rg',
        location: 'eastus',
        accountReplicationType: 'LRS',
        accountTier: 'Standard',
      }),
    });

}

export function createMyStack(
  scope: Construct,
  options: SetRequired<TerrakitOptions<MyTerrakitStackConfig>, 'identifier' | 'providers'>
) {
  const terrakitStack = new TerrakitStack<MyTerrakitStackConfig>(scope, options);
  return new Terrakit(terrakitStack)
    .setController(createController)
}

