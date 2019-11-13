# Run on Red Hat OpenShift

This document shows how to run the `watson-discovery-food-reviews` application in a container running on Red Hat OpenShift.

## Prerequisites

You will need a running OpenShift cluster, or OKD cluster. You can provision [OpenShift on the IBM Cloud](https://cloud.ibm.com/kubernetes/catalog/openshiftcluster).

## Steps

1. [Create an OpenShift project](#1-create-an-openshift-project)
1. [Create the config map](#2-create-the-config-map)
1. [Run the application](#3-run-the-application)

## 1. Create an OpenShift project

* Using the OpenShift web console, select the `Application Console` view.

  ![console-options](https://raw.githubusercontent.com/IBM/pattern-utils/master/openshift/openshift-app-console-option.png)

* Use the `+Create Project` button to create a new project, then click on your project to open it.

* In the `Overview` tab, click on `Browse Catalog`.

  ![Browse Catalog](https://raw.githubusercontent.com/IBM/pattern-utils/master/openshift/openshift-browse-catalog.png)

* Choose the `Node.js` app container and click `Next`.

  ![Choose Node.js](https://raw.githubusercontent.com/IBM/pattern-utils/master/openshift/openshift-choose-nodejs.png)

* Give your app a name and add `https://github.com/IBM/watson-discovery-food-reviews` for the github repo, then click `Create`.

  ![Add github repo](https://raw.githubusercontent.com/IBM/pattern-utils/master/openshift/openshift-add-github-repo.png)

## 2. Create the config map

To complete the config map instructions below, you will need to gather some key values from your Discovery and Watson Knowledge Studio services. Instructions for how to obtain these are located on the main README page.

Click on the `Resources` tab and choose `Config Maps` and then click the `Create Config Map` button:

  ![add config map](https://raw.githubusercontent.com/IBM/pattern-utils/master/openshift/openshift-generic-config-map.png)

Use the `Create Config Map` panel to add our application parameters.

* Provide a `Name` for the config map.
* Add a key named `DISCOVERY_IAM_APIKEY` and paste in the API Key under `Enter a value...`.
* Click `Add Item` and add a key named `DISCOVERY_URL` and paste in the URL under `Enter a value...`..
* Click `Add Item` and add a key named `PORT`, enter 8080 under `Enter a value...`.
* Click `Add Item` and add a key named `DISCOVERY_ENVIRONMENT_ID` and paste in the value under `Enter a value...`..
* Click `Add Item` and add a key named `DISCOVERY_COLLECTION_ID` and paste in the value under `Enter a value...`..
* Click `Add Item` and add a key named `WKS_MODEL_ID` and paste in the value under `Enter a value...`..
* Hit the `Create` button.
* Click on your new Config Map's name.
* Click the `Add to Application` button.
* Select your application from the pulldown.
* Click `Save`.

Go to the `Applications` tab, choose `Deployments` to view the status of your application.

## 3. Run the application

* From the OpenShift or OKD UI, under `Applications` -> `Routes` you will see your app. Click on the `Hostname`to see your Watson Discovery Food Reviews app in action.
* Save this URL.

[![return](https://raw.githubusercontent.com/IBM/pattern-utils/master/deploy-buttons/return.png)](https://github.com/IBM/watson-discovery-food-reviews#sample-ui-layout)
