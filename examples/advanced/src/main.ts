import { App, TerraformStack } from "cdktf";
import { MyStack } from "./MyStack.js";
import { AzurermProvider } from '../.gen/providers/azurerm/provider/index.js';


const app = new App();
const defaultAzureProvider = new AzurermProvider(app, "azurerm_provider_default", {
  /**
  * @note Cannot register providers: Microsoft.AppConfiguration. Errors were: Cannot register provider Microsoft.AppConfiguration with Azure Resource Manager: unexpected status 403 (403 Forbidden) with error: AuthorizationFailed: The client 'your@example.com' with object id '00000000-0000-0000-0000-000000000000' does not have authorization to perform action 'Microsoft.AppConfiguration/register/action' over scope '/subscriptions/00000000-0000-0000-0000-000000000000' or the scope is invalid.
  */
  skipProviderRegistration: true,
});
const myStack = new MyStack(app, {
  identifier: {
    env: 'prod',
    slot: 'prod',
    site: 'active'
  },
  providers: {
    defaultAzureProvider
  },
});

console.log(`We can access the output from the stack: ${myStack.output().mockOutput}`);

app.synth();