import { App, TerraformOutput, TerraformProvider } from "cdktf";
import { type BaseProviders, type CallbackProvider, Terrakit, TerrakitController, type TerrakitOptions, TerrakitStack, type TerrakitStackConfig } from "terrakit";
import { Construct } from "constructs";
import type { SetRequired } from 'type-fest';
import { storageAccount, resourceGroup, provider } from '@cdktf/provider-azurerm';
// import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider/index.js";

const { StorageAccount } = storageAccount;
const { ResourceGroup } = resourceGroup;
const { AzurermProvider } = provider;

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
      .resource({
        id: 'aaa1',
        resource: ({ id, providers }) =>
          new ResourceGroup(this, id, {
            provider: providers.defaultAzureProvider,
            name: 'rg-' + id,
            location: 'eastus'
          })
      }).build();
  }

}


// export function createMyStackOld(
//   scope: Construct,
//   options: SetRequired<TerrakitOptions<MyTerrakitStackConfig>, 'identifier' | 'providers'>
// ) {
//   // 1. First, create the stack:
//   const myTerrakitStack = new TerrakitStack(scope, options);

//   let controller = new TerrakitController(myTerrakitStack, myTerrakitStack.providers)
//     .resource({
//       id: 'aaa1',
//       resource: ({ id, providers, outputs }) =>
//         new ResourceGroup(myTerrakitStack, id, {
//           provider: providers.defaultAzureProvider,
//           name: 'rg-' + id,
//           location: 'eastus'
//         })
//     })
//     .resource({
//       id: 'aaa2',
//       resource: ({ id, providers, outputs }) =>
//         new StorageAccount(myTerrakitStack, id, {
//           provider: providers.defaultAzureProvider,
//           name: 'sa' + id,
//           resourceGroupName: outputs.aaa1.name,
//           location: 'eastus',
//           accountReplicationType: 'LRS',
//           accountTier: 'Standard'
//         })
//     })
//     .resource({
//       id: 'aaa3',
//       if: options.identifier.env === 'prod',
//       resource: ({ id, providers, outputs }) =>
//         new StorageAccount(myTerrakitStack, id, {
//           provider: providers.defaultAzureProvider,
//           name: 'sa' + id,
//           resourceGroupName: outputs.aaa2.accessTier,
//           location: 'eastus',
//           accountReplicationType: 'LRS',
//           accountTier: 'Standard'
//         })
//     })
//     .resource({
//       id: 'aaa4',
//       resource: ({ id, providers, outputs }) =>
//         new StorageAccount(myTerrakitStack, id, {
//           provider: providers.defaultAzureProvider,
//           name: 'sa' + id,
//           resourceGroupName: outputs.aaa3?.name ?? 'default-rg',
//           location: 'eastus',
//           accountReplicationType: 'LRS',
//           accountTier: 'Standard'
//         })
//     });

//   controller.build();

//   new TerraformOutput(myTerrakitStack, "resource-group-name", {
//     value: controller.outputs.aaa1.name
//   });

//   return myTerrakitStack.output(controller);
// };



// const app = new App();
// const defaultProvider = new AzurermProvider(app, "azurerm_provider_default", {
//   // skipProviderRegistration: true,
//   resourceProviderRegistrations: 'core',
//   subscriptionId: '00000000-0000-0000-0000-000000000000',
//   features: [{}]
// });

export const createController = (stack: TerrakitStack<MyTerrakitStackConfig>) => {
  return new TerrakitController(stack, stack.providers)
    .resourceV2({
      id: 'aaa1',
      type: ResourceGroup,
      config: ({ providers }) => ({
        provider: providers.defaultAzureProvider,
        name: 'rg-' + 'aaa1',
        location: 'eastus'
      }),
    })
    .resourceV2({
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
    .resourceV2({
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
    .resourceV2({
      id: 'aaa4',
      type: StorageAccount,
      config: ({ providers, outputs }) => ({
        provider: providers.defaultAzureProvider,
        name: 'sa' + 'aaa4',
        resourceGroupName: outputs.aaa3?.name ?? 'default-rg',
        location: 'eastus',
        accountReplicationType: 'LRS',
        accountTier: 'Standard'
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

