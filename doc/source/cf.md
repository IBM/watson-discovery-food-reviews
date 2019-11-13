# Run on IBM Cloud with Cloud Foundry

This document shows how to run the `watson-discovery-food-reviews` application using Cloud Foundry on IBM Cloud.

> **NOTE**: This app cannot be deployed to IBM Cloud with Cloud Foundry **if** you are using a free trial IBM Cloud account. This type of account is classified as a `Lite` accoount, and has a limit of 256 MB of instantaneous runtime memory available for your Cloud Foundry apps. The `watson-discovery-food-review` app requires 1024 MB.
>
> If you're using a Lite account, you can get more memory by upgrading to a billable account (limit is 2 GB). From the IBM Cloud console, go to **Manage** > **Account**, and select `Account settings`. For more information about Lite account features, see [Lite account](https://cloud.ibm.com/docs/account?topic=account-accounts#liteaccount).

## Steps

1. [Configure credentials](#1-configure-credentials)
1. [Deploy and run the application on IBM Cloud](#2-deploy-and-run-the-application-on-ibm-cloud)

## 1. Configure credentials

1. From the home directory of your cloned local repo, create a .env file by copying it from the sample version.

```bash
cp env.sample .env
```

2. Edit the .env file with the necessary settings.

```bash
# Copy this file to .env and replace the credentials with
# your own before starting the app.

# Watson Discovery
DISCOVERY_URL=<add_discovery_url>
DISCOVERY_IAM_APIKEY=<add_discovery_iam_apikey>
DISCOVERY_ENVIRONMENT_ID=<add_discovery_environment_id>
DISCOVERY_COLLECTION_ID=<add_discovery_collection_id>

# Watson Knowledge Studio
WKS_MODEL_ID=<add_wks_model_id>

# Run locally on a non-default port (default is 3000)
# PORT=3000
```

## 2. Deploy and run the application on IBM Cloud

To deploy to the IBM Cloud, make sure have the [IBM Cloud CLI](https://cloud.ibm.com/docs/cli/reference/bluemix_cli/get_started.html#getting-started) tool installed. Then run the following commands to login using your IBM Cloud credentials.

```bash
cd watson-discovery-food-reviews
ibmcloud login
ibmcloud target --cf
```

When pushing your app to the IBM Cloud, values are read in from the [manifest.yml](manifest.yml) file. Edit this file if you need to change any of the default settings, such as application name or the amount of memory to allocate.

```bash
---
applications:
- path: .
  name: watson-discovery-food-reviews
  buildpack: sdk-for-nodejs
  memory: 1024M
  instances: 1
```

To deploy your application, run the following command.

```bash
ibmcloud cf push
```

> NOTE: The URL route assigned to your application will be displayed as a result of this command. Note this value, as it will be required to access your app.

To view the application, go to the IBM Cloud route assigned to your app. Typically, this will take the form `https://<app name>.mybluemix.net`.

To view logs, or get overview information about your app, use the IBM Cloud dashboard.

[![return](https://raw.githubusercontent.com/IBM/pattern-utils/master/deploy-buttons/return.png)](https://github.com/IBM/watson-discovery-food-reviews#sample-ui-layout)
