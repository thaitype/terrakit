import { App } from "cdktf";
import { createMyStack, MyStack } from "./MyStack.js";
import { AzurermProvider } from '../.gen/providers/azurerm/provider/index.js';

const app = new App();
const myStack = new MyStack(app, {
  identifier: {
    env: 'prod',
    slot: 'prod',
    site: 'active'
  },
  providers: {
    defaultAzureProvider: (scope) => new AzurermProvider(scope, "azurerm_provider_default", {
      skipProviderRegistration: true,
    })
  },
  overrideResources: {
    myResourceGroup: {
      name: 'new-resource-group-name',
    }
  }
});



// console.log(`We can access the output from the stack: ${myStack.output().mockOutput}`);

app.synth();