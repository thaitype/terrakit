import { type CallbackProvider, type ComposerFactoryFn, Terrakit, BlockComposer, type TerrakitOptions, TerrakitStack, type TerrakitStackConfig } from "terrakit";
import { Construct } from "constructs";
import { ResourceGroup } from "@cdktf/provider-azurerm/lib/resource-group/index.js";
import { StorageAccount } from "@cdktf/provider-azurerm/lib/storage-account/index.js";
import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider/index.js";

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

  // if (stack.options.identifier.site === 'active') {
  //   return resourceGroup.merge(storageAccount);
  // }
  // return resourceGroup;
  return resourceGroup.merge(storageAccount);

}

export function createMyStack(
  scope: Construct,
  stackId: string,
  options: MyTerrakitStackConfig
) {
  const terrakitStack = new TerrakitStack<MyTerrakitStackConfig>(scope, stackId, options);
  return new Terrakit(terrakitStack)
    .setComposer(createComposer)
}

export function createStack<
  ComposerFactory extends ComposerFactoryFn<any>,
>(callbackComposer: ComposerFactory) {
  return {
    from(
      scope: Construct,
      name: string,
      options: Parameters<ComposerFactory>[0]['options']
    ) {
      const terrakitStack = new TerrakitStack(scope, name, options);
      return new Terrakit(terrakitStack).setComposer(callbackComposer);
    },
  };
}

export const MyStack = createStack((stack: TerrakitStack<MyTerrakitStackConfig>) => {
  const resourceGroup = new BlockComposer(stack, stack.providers)
    .addClass({
      id: 'resource_group',
      type: ResourceGroup,
      config: ({ providers }) => ({
        provider: providers.defaultAzureProvider,
        name: 'rg-' + stack.options.vars.env,
        location: 'eastus'
      }),
    })

  return resourceGroup;
});

// function composerFactory<Config extends TerrakitStackConfig = TerrakitStackConfig>(stack: TerrakitStack<Config>) {
//   return {
//     create: () => new BlockComposer(stack, stack.providers)
//   }
// }

// class ComposerFactory<Config extends TerrakitStackConfig> {
//   constructor(
//     private stack: TerrakitStack<Config>
//   ) { }

//   create() {
//     return new BlockComposer(this.stack, this.stack.providers)
//   }
// }

// interface StackContext<Config extends TerrakitStackConfig = TerrakitStackConfig> {
//   stack: TerrakitStack<Config>;
//   composer: ComposerFactory<Config>;
// }


export function createStackV2<
  CF extends ComposerFactoryFn<any>,
  Config extends TerrakitStackConfig = CF extends (stack: TerrakitStack<infer C>) => any ? C : never
>(callbackComposer: CF) {
  return {
    from(
      scope: Construct,
      name: string,
      options: Config
    ) {
      const terrakitStack = new TerrakitStack<Config>(scope, name, options);
      return new Terrakit(terrakitStack).setComposer(callbackComposer);
    },
  };
}

export const MyStackV2 = createStackV2((stack: TerrakitStack<MyTerrakitStackConfig>) => {
  const resourceGroup = new BlockComposer(stack, stack.providers)
    .addClass({
      id: 'resource_group',
      type: ResourceGroup,
      config: ({ providers }) => ({
        provider: providers.defaultAzureProvider,
        name: 'rg-' + stack.options.vars.env,
        location: 'eastus'
      }),
    })

  return resourceGroup;
});

const stack2 = MyStackV2.from({} as any, 'stack1', {
  vars: {
    env: 'prod',
    slot: 'prod',
    site: 'active'
  },
  providers: {
    defaultAzureProvider: (scope) => new AzurermProvider(scope, "azurerm_provider_default", {
      subscriptionId: '00000000-0000-0000-0000-000000000000',
      features: {}
    })
  }
}).build();



