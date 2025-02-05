import { App, TerraformOutput, TerraformProvider } from "cdktf";
import { type BaseProviders, type CallbackProvider, TerrakitController, type TerrakitOptions, TerrakitStack, type TerrakitStackConfig } from "terrakit";
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


export function createMyStack(
  scope: Construct,
  options: SetRequired<TerrakitOptions<MyTerrakitStackConfig>, 'identifier' | 'providers'>
) {
  // 1. First, create the stack:
  const myTerrakitStack = new TerrakitStack(scope, options);

  let controller = new TerrakitController(myTerrakitStack, myTerrakitStack.providers)
    .resource({
      id: 'aaa1',
      resource: ({ id, providers, outputs }) =>
        new ResourceGroup(myTerrakitStack, id, {
          provider: providers.defaultAzureProvider,
          name: 'rg-' + id,
          location: 'eastus'
        })
    })
    .resource({
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
    .resource({
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
    .resource({
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

  controller.build();

  new TerraformOutput(myTerrakitStack, "resource-group-name", {
    value: controller.outputs.aaa1.name
  });

  return myTerrakitStack.output(controller);
};

// export abstract class Terrakit {
//   constructor() {}

//   build() { 
//     console.log('Building');
//   }

//   abstract defineResources(controller: TerrakitController): void;

// }

export class Terrakit<Config extends TerrakitStackConfig> {
  constructor(public readonly stack: TerrakitStack<Config>) {
  }

  setController<T extends Record<string, unknown>>(callbackController: (scope: Construct, stack: TerrakitStack<Config>) => TerrakitController<T>) {
    console.log('Defining resources');
    callbackController(this.stack.scope, this.stack);
    return this;
  }

  overrideResources(arg: any) {
    return this;
  }

  build() { }
}

export function createTerrakitStack(scope: Construct, options: SetRequired<TerrakitOptions<MyTerrakitStackConfig>, 'identifier' | 'providers'>) {
  return {}
}
const app = new App();
const defaultProvider = new AzurermProvider(app, "azurerm_provider_default", {
  // skipProviderRegistration: true,
  resourceProviderRegistrations: 'core',
  subscriptionId: '00000000-0000-0000-0000-000000000000',
  features: [{}]
});

export const createController = (scope: Construct, stack: TerrakitStack<MyTerrakitStackConfig>) => {
  return new TerrakitController(scope, stack.providers)
    .resource({
      id: 'aaa1',
      resource: ({ id, providers, outputs }) =>
        new ResourceGroup(app, id, {
          provider: providers.defaultAzureProvider,
          name: 'rg-' + id,
          location: 'eastus'
        })
    })
}

const myTerrakitStack = new TerrakitStack<MyTerrakitStackConfig>(app, {} as any);
const stack = new Terrakit(myTerrakitStack)
  .setController(createController)
  .overrideResources({
    aaa1: {
      name: 'new-resource-group-name'
    }
  })
  .build();

