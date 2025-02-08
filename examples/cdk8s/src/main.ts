import { Construct } from 'constructs';
import { App, Chart, type ChartProps } from 'cdk8s';
import * as k8s from '../imports/k8s.js';

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);


    const label = { app: 'hello-k8s' };
    this.createDeployment(label);
    this.createService(label);

  }

  createDeployment(label: any) {
    new k8s.KubeDeployment(this, 'deployment', {
      spec: {
        replicas: 1,
        selector: {
          matchLabels: label
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'web',
                image: 'nginx',
                ports: [{ containerPort: 80 }]
              }
            ]
          }
        }
      }
    });
  }

  createService(label: any) {
    new k8s.KubeService(this, 'service', {
      spec: {
        type: 'LoadBalancer',
        ports: [{ port: 80, targetPort: k8s.IntOrString.fromNumber(80) }],
        selector: label
      }
    });
  }


}

const app = new App();
new MyChart(app, 'tmp');
app.synth();
