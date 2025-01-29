import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider";
import * as az from '@cdktf/provider-azurerm';
import { ResourceGroup } from "@cdktf/provider-azurerm/lib/resource-group";
import { getResourceName } from "../../src/index.js";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // define resources here

    new AzurermProvider(this, "AzureRm", {
      features: {},
    });

    const resourceGroup = new ResourceGroup(this, "rg-example", {
      name: "devops-resource-group-" + getResourceName(),
      location: "eastus",
    })

    resourceGroup.id
  }
}

const app = new App();
new MyStack(app, "demo-cdktf");
app.synth();