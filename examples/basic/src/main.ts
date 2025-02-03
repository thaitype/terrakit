import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import * as az from '@cdktf/provider-azurerm';
import { getResourceName, TerrakitStack, type TerrakitOptions } from 'terrakit';
import { AzurermProvider } from '../.gen/providers/azurerm/provider/index.js';
import { ResourceGroup } from '../.gen/providers/azurerm/resource-group/index.js';

class MyStack extends TerrakitStack {
  constructor(scope: Construct, options: TerrakitOptions) {
    super(scope, options);

    // define resources here

    new AzurermProvider(this, "AzureRm", {});

    const resourceGroup = new ResourceGroup(this, "rg-example", {
      name: "devops-resource-group-" + getResourceName(),
      location: "eastus",
    })

    resourceGroup.id
  }
}

const app = new App();
new MyStack(app, {
  id: "demo-cdktf"
});
app.synth();