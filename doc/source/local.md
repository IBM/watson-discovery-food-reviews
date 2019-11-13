# Run locally

This document shows how to run the `watson-discovery-food-reviews` application on your local machine.

## Steps

1. [Configure credentials](#1-configure-credentials)
1. [Run the application](#2-run-the-application)

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

## 2. Run the application

1. Install [Node.js](https://nodejs.org/en/) runtime or NPM.
1. Start the app by running `npm install`, followed by `npm start`. If running for the first time, please be patient as the initialization process needs to load 1000 json files into your **Watson Discovery Collection** and may take several minutes.
1. Access the UI by pointing your browser at `localhost:3000`.
> Note: `PORT` can be configured in the .env file.

[![return](https://raw.githubusercontent.com/IBM/pattern-utils/master/deploy-buttons/return.png)](https://github.com/IBM/watson-discovery-food-reviews#sample-ui-layout)
