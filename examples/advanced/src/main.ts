import { App, TerraformOutput } from "cdktf";
import { createMyStack, MyStack } from "./MyStack.js";
import { AzurermProvider } from '../.gen/providers/azurerm/provider/index.js';

const app = new App();
const myStack = createMyStack(app, {
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
  // overrideResources: {
  //   myResourceGroup: {
  //     name: 'new-resource-group-name',
  //   }
  // }
});





app.synth();

