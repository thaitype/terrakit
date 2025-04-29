import { type CallbackProvider, type ComposerFactoryFn, Terrakit, BlockComposer, type TerrakitOptions, TerrakitStack, type TerrakitStackConfig } from "terrakit";
import { Construct } from "constructs";
import { ResourceGroup } from "@cdktf/provider-azurerm/lib/resource-group/index.js";

export interface ResourceGroupStackConfig {
  vars: {
    location: string;
  };
  providers: {
    defaultAzureProvider: CallbackProvider;
  };
}

export const defineResources = (stack: TerrakitStack<ResourceGroupStackConfig>) => {
  return stack.newComposer()
    .addClass({
      id: 'my_resource_group',
      type: ResourceGroup,
      config: ({ providers }) => ({
        provider: providers.defaultAzureProvider,
        name: 'rg-' + 'aaa1',
        location: stack.options.vars.location,
      }),
    })
}

export function createResourceGroupStack(
  scope: Construct,
  stackId: string,
  options: ResourceGroupStackConfig,
) {
  const terrakitStack = new TerrakitStack<ResourceGroupStackConfig>(scope, stackId, options);
  return new Terrakit(terrakitStack)
    .setComposer(defineResources)
}