import { App, TerraformOutput } from "cdktf";
import { MyStack } from "./MyStack.js";
import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider/index.js";

const app = new App();
const myStack = new MyStack(app, {
  identifier: {
    env: 'prod',
    slot: 'prod',
    site: 'active'
  },
  providers: {
    defaultAzureProvider: (scope) => new AzurermProvider(scope, "azurerm_provider_default", {
      // skipProviderRegistration: true,
      resourceProviderRegistrations: 'core',
      subscriptionId: '00000000-0000-0000-0000-000000000000',
      features: [{}]
    })
  },
}).configureStack()
  .overrideStack({
    aaa1: {
      name: 'custom-rg'
    }
  })
  .build();


app.synth();

