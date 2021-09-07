# DCSA AWS Infrastructure

This repository contains the infrastructure code for deploying the DCSA Sandbox software in your own AWS environment.

The infrastructure is defined using [AWS CDK](https://aws.amazon.com/cdk/) . AWS CDK is infrastructure as code, basically we are describing the infrastructure using typescript.

The preferred way of deploying the DCSA Sandbox is using deploying it in a Kubernetes cluster. The CDK code in this repository deploys an EKS Fargate Cluster on AWS and installs the DCSA Sandbox using Helm Charts found in the XXXXX repository

## How to get started

This guide will help you getting the DCSA Sandbox running on your AWS account.

### What do I need to know?

Do I have to been an AWS expert, skilled in Kubernetes or master of Typescript?. Not at all, just basic programming skills are necessary. But if you would like to learn more about the technologies involved please have a look at additional resources below.

## Prerequistes 

1. You need an AWS Account, for more info on how to create an account see https://aws.amazon.com/free/

2. Install node.js, how to install see https://nodejs.org/en/download/

3. Install TypeScript,
   ```npm install -g typescript``` 
   
4. Install AWS CLI, https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

5. Configure AWS CLI, https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html

6. Install AWS-CDK, ```npm install -g aws-cdk```

7. Install Kubernetes tools, https://kubernetes.io/docs/tasks/tools/

8. Install Helm, https://helm.sh/docs/intro/install/

9. Clone this project, if you didn't already do that

8. TODO Configure this project, TODO  region, account id, dns

9. Deploy the DCSA Sandbox, ```run cdk deploy```. This can take some time, 20-30minutes.

10. After completing step 9, the command line will output something like this:
    DCSAStack.EKSClusterDCSAClusterConfigCommandF987C765 = aws eks update-kubeconfig --name DCSACluster --region eu-west-1 --role-arn arn:aws:iam::133515735418:role/DCSAStack-EKSClusterDCSAClusterMastersRole2DEBA5E4-K9UTI90EPWAR
    Copy the aws eks .... and run it in your terminal
    
11. Add the DCSA Helm Chart repo, ```helm repo add TODO```

12. Deploy the DCSA Sandbox to the aws cluster, ```helm install sandbox dcsa```

1x. TODO, how to get the url from the kubectl and so on.



# Additional resources

* AWS CDK - https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html
* TypeScript - https://www.typescriptlang.org
* Kubernetes - https://kubernetes.io
* Helm Charts - https://helm.sh


# TODO 
DNS Handling
