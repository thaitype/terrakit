import { App, TerraformOutput } from "cdktf";
import { createMyStack, createMyStackOld } from "./MyStack.js";
import { provider } from '@cdktf/provider-azurerm';

const { AzurermProvider } = provider;

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
})
.overrideResources({})
.build();


app.synth();

