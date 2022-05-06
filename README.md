# DCSA AWS Infrastructure

This repository contains the infrastructure code for deploying the DCSA Sandbox software in your own AWS environment.

The infrastructure is defined using [AWS CDK](https://aws.amazon.com/cdk/) . AWS CDK is infrastructure as code, basically we are describing the infrastructure using typescript.

The preferred way of deploying the DCSA Sandbox is using deploying  it in a Kubernetes cluster. The CDK code in this repository deploys an EKS Fargate Cluster on AWS and installs the DCSA Sandbox using Helm Charts found in the XXXXX repository

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
DNS Handling  d

# Steps to create a new cluster

in route53 create public hosted zone , this gives us a range of dns entries that should be setup in ?

In AWS IAM make a user to be used when deploying from github action(suggested name > github_actions_user)  
For AWS access type choose "Access key - Programmatic access" and apply the policy "AdministratorAccess" to user.
User credentials will be saved in a github secret in later step.

Make a new yaml file in .github\workflows that describes the cluster.
(Edit a copy of the already existing release yaml files)
We setup each deployment to run when a merge is made to a branch for this cluster.
So in github make a new branch for the cluster and in the release file set
    on:
        push:
            branches: [ branchname ]

Fill out the first section with AccountId from aws account
baseurl and hostedzoneid from route53 hosted zone

If notifications is needed go to aws ses dashboard and create smtp credentials (note the password) and fill in smtpusername
leave cognitoappclientid and cognitoappclientid blank
Fill in helmversion with version needed from the Kubernetes-Packaging repo, e.g. for P6 it can be found in charts\hamburg-cluster\chart.yaml
Set dockerImageTag to the tag from the docker image you want to deploy, will default to latest
helmChartName and ingressChartName from Kubernetes-Packaging repo
participantsfile should point to a json file in same repo that holds information of all the participants
deploydb should be set to true first time deploying to setup databases in RDS

the next section contains some secrets, this is names of github Actions secrets from AWS-Deployment-Infrastructure repo
Naming convention is the cluster name with variable name appended
So you should make 5 secrets in the repos setting > secrets > action secrets (you must have admin access to repo to edit settings) :

{CLUSTERNAME}SMTPPASSWORD = AWS ses smtp password from above step
Set {CLUSTERNAME}AWSSECRETACCESSKEY and {CLUSTERNAME}AWSACCESSKEYID to credentials for github_actions_user accordingly
{CLUSTERNAME}PARTICIPANTS should hold the same value as the participantsfile from above step
{CLUSTERNAME}_DBPASSWORD Password used to access AWS RDS database from the services running in the cluster, so just add a strong password.
Must be longer tham 8 chars

Add another secret to secrets in the AWS-Deployment-Infrastructure describing the participants/organizations and there contact email in json format
Naming convention here is cluster name + environment type + "PARTICIPANTS" like > HAMBURGDEVPARTICIPANTS
format for participant string is :
[{
	"name": "firstcarrier",
	"email": "email@email.com",
	"publisherroles": "CA,AG,VSL"
	"partycode": "MSK"
}, {
	"name": "terminal",
	"email": "NOT_SPECIFIED",
	"publisherroles": "TR",
	"partycode": "MSK"
}]

Participant name can not contain special characters as '-' cause the name is used to create resource like databases where this is not allowed
To disable email notifications for a participant use "NOT_SPECIFIED" in the email field 
publisher roles can consist of any number of these roles
 "CA", "AG", "VSL", "TR", "ATH", "PLT", "TWG", "BUK", "LSH"
 or an empty string or "[]" to have no roles assigned.

Make a participants json file in \sqlscripts\ folder with same contents as the PARTICIPANTS github secret  

Push the files to the branch name to trigger deployment.
On github > actions you can follow the progress of deployment
