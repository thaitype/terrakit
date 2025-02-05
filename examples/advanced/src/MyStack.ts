import { App, TerraformOutput, TerraformProvider } from "cdktf";
import { type BaseProviders, type CallbackProvider, TerrakitController, type TerrakitOptions, TerrakitStack } from "terrakit";
import { Construct } from "constructs";
import { ResourceGroup } from '../.gen/providers/azurerm/resource-group/index.js';
import { AzurermProvider } from "../.gen/providers/azurerm/provider/index.js";
import type { SetRequired } from 'type-fest';
import { StorageAccount } from '../.gen/providers/azurerm/storage-account/index.js';

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


  constructor(scope: Construct, public readonly options: SetRequired<TerrakitOptions<TerrakitStackConfig>, 'identifier' | 'providers'>) {
    super(scope, options);

    const controller = this.controller
      .resource('aaa1', ({ id }) => this.resourceGroup(id)).build();
  }

  resourceGroup(id: string) {
    return new ResourceGroup(this, id, {
      provider: this.providers.defaultAzureProvider,
      name: 'rg-' + id,
      location: 'eastus'
    });
  }


}

// export const createMyStack = (scope: Construct, options: SetRequired<TerrakitOptions<TerrakitStackConfig>, 'identifier' | 'providers'>) => {
//   // return new TerrakitStack<TerrakitStackConfig>(scope, options).controller
//   //   .addResource('aaa1', ({ id, providers, scope }) => new ResourceGroup(scope, id, {
//   //     provider: providers.defaultAzureProvider,
//   //     // provider: new AzurermProvider(scope, "azurerm_provider_default", {}),
//   //     name: 'rg-' + id,
//   //     location: 'eastus'
//   //   }))

//   const controller = new ResourceController(scope, TerrakitStack.setupProviders(scope, options))
//     .addResource('aaa1', ({ id, providers }) => new ResourceGroup(scope, id, {
//       provider: providers.defaultAzureProvider,
//       name: 'rg-' + id,
//       location: 'eastus'
//     }));
//   return new TerrakitStack(scope, {
//     ...options,
//     controller
//   }).output(controller);

// }

export const createMyStack = (
  scope: Construct,
  options: SetRequired<TerrakitOptions<TerrakitStackConfig>, 'identifier' | 'providers'>
) => {
  // 1. First, create the stack:
  const myTerrakitStack = new TerrakitStack(scope, options);

  // 2. Create a controller that uses *myTerrakitStack* as the scope so
  //    that resources become children of the TerrakitStack:
  let controller1 = new TerrakitController(myTerrakitStack, myTerrakitStack.providers)
    .resource('aaa1', ({ id, providers, outputs }) =>
      new ResourceGroup(myTerrakitStack, id, {
        provider: providers.defaultAzureProvider,
        name: 'rg-' + id,
        location: 'eastus'
      }))
    .resource('aaa2', ({ id, providers, outputs }) =>
      new StorageAccount(myTerrakitStack, id, {
        provider: providers.defaultAzureProvider,
        name: 'sa' + id,
        resourceGroupName: outputs.aaa1.name,
        location: 'eastus',
        accountReplicationType: 'LRS',
        accountTier: 'Standard'
      }))
    .resource('aaa3',
      options.identifier.env === 'prod',
      ({ id, providers, outputs }) =>
        new StorageAccount(myTerrakitStack, id, {
          provider: providers.defaultAzureProvider,
          name: 'sa' + id,
          resourceGroupName: outputs.aaa2.accessTier,
          location: 'eastus',
          accountReplicationType: 'LRS',
          accountTier: 'Standard'
        }))
    .resource('aaa4', ({ id, providers, outputs }) =>
      new StorageAccount(myTerrakitStack, id, {
        provider: providers.defaultAzureProvider,
        name: 'sa' + id,
        resourceGroupName: outputs.aaa3?.name ?? 'default-rg',
        location: 'eastus',
        accountReplicationType: 'LRS',
        accountTier: 'Standard'
      }));

  // controller1.build();

  let controller2 = new TerrakitController(myTerrakitStack, myTerrakitStack.providers)
    .resourceV2({
      id: 'aaa1',
      resource: ({ id, providers, outputs }) =>
        new ResourceGroup(myTerrakitStack, id, {
          provider: providers.defaultAzureProvider,
          name: 'rg-' + id,
          location: 'eastus'
        })
    })
    .resourceV2({
      id: 'aaa2',
      resource: ({ id, providers, outputs }) =>
        new StorageAccount(myTerrakitStack, id, {
          provider: providers.defaultAzureProvider,
          name: 'sa' + id,
          resourceGroupName: outputs.aaa1.name,
          location: 'eastus',
          accountReplicationType: 'LRS',
          accountTier: 'Standard'
        })
    })
    .resourceV2({
      id: 'aaa3',
      if: options.identifier.env === 'prod',
      resource: ({ id, providers, outputs }) =>
        new StorageAccount(myTerrakitStack, id, {
          provider: providers.defaultAzureProvider,
          name: 'sa' + id,
          resourceGroupName: outputs.aaa2.accessTier,
          location: 'eastus',
          accountReplicationType: 'LRS',
          accountTier: 'Standard'
        })
    })
    .resourceV2({
      id: 'aaa4',
      resource: ({ id, providers, outputs }) =>
        new StorageAccount(myTerrakitStack, id, {
          provider: providers.defaultAzureProvider,
          name: 'sa' + id,
          resourceGroupName: outputs.aaa3?.name ?? 'default-rg',
          location: 'eastus',
          accountReplicationType: 'LRS',
          accountTier: 'Standard'
        })
    });

  controller2.build();

  new TerraformOutput(myTerrakitStack, "resource-group-name", {
    value: controller1.getOutput().aaa1.name
  });

  return myTerrakitStack.output(controller1);
};

