import { App } from "cdktf";
import { MyStack } from "./MyStack.js";

const app = new App();
new MyStack(app, "demo-cdktf", {
  identifier: {
    env: 'prod',
    slot: 'prod',
    site: 'active'
  }
});
app.synth();