import { Construct } from "constructs";
import { App } from "cdktf";
import { TerrakitStack, type TerrakitOptions } from 'terrakit';
import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider/index.js";
import { ResourceGroup } from "@cdktf/provider-azurerm/lib/resource-group/index.js";

class MyStack extends TerrakitStack {
  constructor(scope: Construct, options: TerrakitOptions) {
    super(scope, options);

    // define resources here

    new AzurermProvider(this, "AzureRm", {
      resourceProviderRegistrations: 'core',
      subscriptionId: '00000000-0000-0000-0000-000000000000',
      features: [{}]
    });

    const resourceGroup = new ResourceGroup(this, "rg-example", {
      name: "devops-resource-group",
      location: "eastus",
    })

    resourceGroup.id
  }
}

const app = new App();
new MyStack(app, {
  id: "demo-cdktf",
  identifier: {}
});
app.synth();