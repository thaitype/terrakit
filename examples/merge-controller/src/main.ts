import { App } from "cdktf";
import { createMyStack } from "./MyStack.js";
import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider/index.js";

const app = new App();
const myStack = createMyStack(app, 'merge-controller', {
  inputs: {
    env: 'prod',
    slot: 'prod',
    site: 'active'
  },
  providers: {
    defaultAzureProvider: (scope) => new AzurermProvider(scope, "azurerm_provider_default", {
      // skipProviderRegistration: true,
      subscriptionId: '00000000-0000-0000-0000-000000000000',
      features: undefined
    })
  },
})
  .override({
    storage_account: {
      name: 'custom-rg'
    },
    resource_group: {
      name: 'my-rg'
    }
  })
  .build();


app.synth();

