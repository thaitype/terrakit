import { App, TerraformStack } from "cdktf";
import { createStack, MyStack } from "./MyStack.js";
import { AzurermProvider } from '../.gen/providers/azurerm/provider/index.js';
import type { Construct } from "constructs";
import { ResourceGroup } from "../.gen/providers/azurerm/resource-group/index.js";

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
// const myStack = createStack(app, {
//   identifier: {
//     env: 'prod',
//     slot: 'prod',
//     site: 'active'
//   },
//   providers: {
//     defaultAzureProvider
//   },
//   overrideResources: {
//     myResourceGroup: {
//       name: 'new-resource-group-name',
//     }
//   }
// });

console.log(`We can access the output from the stack: ${myStack.output().mockOutput}`);

app.synth();