import { App } from "cdktf";
import { createResourceGroupStack } from "./ResourceGroupStack.js";
import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider/index.js";
import { createStorageAccountStack } from "./StorageAccountStack.js";

const app = new App();

const resourceGroup = createResourceGroupStack(app, 'cross-stack-rg', {
  vars: {
    location: 'eastus',
  },
  providers: {
    defaultAzureProvider: (scope) => new AzurermProvider(scope, "azurerm_provider_default", {
      // skipProviderRegistration: true,
      subscriptionId: '00000000-0000-0000-0000-000000000000',
      features: {}
    })
  },
})
  .override({
    my_resource_group: {
      name: 'my-rg'
    }
  })
  .build();

if (!resourceGroup.outputs.my_resource_group) {
  throw new Error(`ResourceGroup is not defined`);
}

const storageAccount = createStorageAccountStack(app, 'cross-stack-storage', {
  vars: {
    resourceGroupName: resourceGroup.outputs.my_resource_group.name,
  },
  providers: {
    defaultAzureProvider: (scope) => new AzurermProvider(scope, "azurerm_provider_default", {
      // skipProviderRegistration: true,
      subscriptionId: '00000000-0000-0000-0000-000000000000',
      features: {}
    })
  },
})
  .override({
    my_storage_account: {
      name: 'my_storage-account',
    }
  })
  .build();

app.synth();

