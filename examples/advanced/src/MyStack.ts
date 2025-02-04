import { App, TerraformProvider } from "cdktf";
import { type BaseProviders, type CallbackProvider, TerrakitController, type TerrakitOptions, TerrakitStack } from "terrakit";
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


  constructor(scope: Construct, public readonly options: SetRequired<TerrakitOptions<TerrakitStackConfig>, 'identifier' | 'providers'>) {
    super(scope, options);

    this.controller
      .addResource('aaa1', ({ id }) => this.resourceGroup(id)).build();
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
  const controller = new TerrakitController(myTerrakitStack, myTerrakitStack.providers)
    .addResource('aaa1', ({ id, providers }) =>
      new ResourceGroup(myTerrakitStack, id, {
        provider: providers.defaultAzureProvider,
        name: 'rg-' + id,
        location: 'eastus'
      })
    )
    .build();

  // Attach that controller to the TerrakitStack so it can manage outputs:
  // (If your TerrakitStack constructor does something special with controllers,
  // you may pass in an updated options object, or just set it afterwards.)
  myTerrakitStack.controller = controller;

  // 3. Return the actual TerrakitStack instance, not just the outputs:
  return myTerrakitStack;
};

