[![Build Status](https://travis-ci.org/IBM/watson-discovery-food-reviews.svg?branch=master)](https://travis-ci.org/IBM/watson-discovery-food-reviews)
![IBM Cloud Deployments](https://metrics-tracker.mybluemix.net/stats/c612c58fcbb9552f348a4e0e5e148846/badge.svg)

# Discovery customer sentiment from product reviews

In this Code Pattern, we walk you through a working example of a web application that queries and manipulates data from the Watson Discovery Service. With the aid of data modeling using the Watson Knowledge Studio service, the data will have additional enrichments that will provide improved insights for user analysis.

This web app contains multiple UI components that you can use as a starting point for developing your own Watson Discovery and Knowledge Studio service applications. 

The main benefit of using the Watson Discovery Service is its powerful analytics engine that provides cognitive enrichments and insights into your data. This app provides examples of how to showcase these enrichments through the use of filters, lists and graphs. The key enrichments that we will focus on are:

* Entities - people, companies, organizations, cities, and more.
* Categories - classification of the data into a hierarchy of categories up to 5 levels deep.
* Concepts - identified general concepts that aren't necessarily referenced in the data.
* Keywords - important topics typically used to index or search the data.
* Entity Types - 
* Relations - 
* Sentiment - the overall positive or negative sentiment of each document.

With Watson Knowledge Studio (WKS), data modeling can be used to inform Watson Discovery of additional entities and relationships that go beyond its default entity extraction and enrichment process. Through the use of annotations, the user can indicate entities and entity relationships on a small subset of documents, which can then be applied to a much larger set of similar documents. This model can then be applied to a Watson Discovery service instance and encorporated into the Discovery enrichment process as documents are uploaded into the service. 

For this Code Pattern, we will be using data that contains food reviews.

When the reader has completed this Code Pattern, they will understand how to:
* Use Watson Knowledge Studio to create a data model.
* Deploy a WKS model to Watson Discovery.
* Load and enrich data in the Watson Discovery Service.
* Query and manipulate data in the Watson Discovery Service.
* Create UI components to represent enriched data created by the Watson Discovery Service.
* Build a complete web app that utilizes popular JavaScript technologies to feature Watson Discovery Service data and enrichments.

![](doc/source/images/architecture.png)

## Flow
1. A sample set of review documents are loaded into WKS for annotation.
2. A WKS model is created.
3. The WKS model is applied to a Watson Discovery service instance.
4. The food review json files are added to the Discovery collection.
5. The user interacts with the backend server via the app UI. The frontend app UI uses React to render search results and can reuse all of the views that are used by the backend for server side rendering. The frontend is using semantic-ui-react components and is responsive.
6. User input is processed and routed to the backend server, which is responsible for server side rendering of the views to be displayed on the browser. The backend server is written using express and uses express-react-views engine to render views written using React.
7. The backend server sends user requests to the Watson Discovery Service. It acts as a proxy server, forwarding queries from the frontend to the Watson Discovery Service API while keeping sensitive API keys concealed from the user.

> NOTE: see [DEVELOPING.md](DEVELOPING.md) for project structure.

## Included components
* [Watson Discovery](https://www.ibm.com/watson/developercloud/discovery.html): A cognitive search and content analytics engine for applications to identify patterns, trends, and actionable insights.
* [Watson Knowledge Studio](https://www.ibm.com/watson/services/knowledge-studio/): Teach Watson the language of your domain with custom models that identify entities and relationships unique to your industry, in unstructured text. Use the models in Watson Discovery, Watson Natural Language Understanding, and Watson Explorer.

## Featured technologies
* [Node.js](https://nodejs.org/): An open-source JavaScript run-time environment for executing server-side JavaScript code.
* [React](https://facebook.github.io/react/): A JavaScript library for building User Interfaces.
* [Express](https://expressjs.com) - A popular and minimalistic web framework for creating an API and Web server.
* [Semantic UI React](https://react.semantic-ui.com/introduction): React integration of Semantic UI components. 
* [Chart.js](http://www.chartjs.org/): JavaScript charting package.
* [Jest](https://facebook.github.io/jest/): A JavaScript test framework.

# Steps

Use the ``Deploy to IBM Cloud`` button **OR** create the services and run locally.

## Deploy to IBM Cloud

[![Deploy to IBM Cloud](https://metrics-tracker.mybluemix.net/stats/c612c58fcbb9552f348a4e0e5e148846/button.svg)](https://bluemix.net/deploy?repository=https://github.com/IBM/watson-discovery-food-reviews)

1. Due to the requirement that the Watson Discovery service has to exist before a WKS model can be applied, you must first create the Discovery service manually by going to the following link: [**Watson Discovery**](https://console.ng.bluemix.net/catalog/services/discovery).

2. Rename your service to: `wdfr-discovery-service`.

3. Press the above ``Deploy to IBM Cloud`` button and then click on ``Deploy``.

4. In Toolchains, click on Delivery Pipeline to watch while the app is deployed. Once deployed, the app can be viewed by clicking 'View app'.

![](doc/source/images/toolchain-pipeline.png)

5. To see the app created and configured for this journey, use the IBM Cloud dashboard. The app is named `watson-discovery-food-reviews` with a unique suffix. 

## Run locally
> NOTE: These steps are only needed when running locally instead of using the ``Deploy to IBM Cloud`` button.

1. [Clone the repo](#1-clone-the-repo)
2. [Create IBM Cloud services](#2-create-ibm-cloud-services)
3. [Create a Watson Knowledge Studio workspace](#3-create-a-watson-knowledge-studio-workspace)
4. [Upload Type System](#4-upload-type-system)
5. [Import Corpus Documents](#5-import-corpus-documents)
6. [Create an Annotation Set](#6-create-an-annotation-set)
7. [Create a Task for Human Annotation](#7-create-a-task-for-human-annotation)
8. [Create the model](#8-create-the-model)
9. [Deploy the machine learning model to Watson Discovery](#9-deploy-the-machine-learning-model-to-watson-discovery)
10. [Load the Discovery files](#3-load-the-discovery-files)
11. [Configure credentials](#4-configure-credentials)
12. [Run the application](#5-run-the-application)

### 1. Clone the repo
```
$ git clone https://github.com/IBM/watson-discovery-food-reviews
```

### 2. Create IBM Cloud services

Create the following services:

* [**Watson Discovery**](https://console.ng.bluemix.net/catalog/services/discovery)
* [**Watson Knowledge Studio**](https://console.bluemix.net/catalog/services/knowledge-studio)

## 3. Create a Watson Knowledge Studio workspace

Launch the **WKS** tool and create a new **workspace**.

## 4. Upload Type System

A type system allows us to define things that are specific to review documents. The type system controls how content can be annotated by defining the types of entities that can be labeled and how relationships among different entities can be labeled.

## 5. Import Corpus Documents

Corpus documents are required to train our machine-learning annotator component. For this Code Pattern, the corpus documents will contain example review documents.

## 6. Create an Annotation Set

Once the corpus documents are loaded, we can start the human annotation process. This begins by dividing the corpus into multiple document sets and assigning the document sets to human annotators (for this Code Pattern, we will just be using using one document set and one annotator).

From the **Access & Tools -> Documents** panel, press the **Create Annotation Sets** button. Select a valid **Annotator** user, and provide a unique name for **Set name**.

## 7. Create a Task for Human Annotation

Add a task for human annotation by creating a task and assigning it annotation sets.

From the **Access & Tools -> Documents** panel, select the **Task** tab and press the **Add Task** button.

### 7.1 Start the Human Annotation task

Click on the task card to view the task details panel.

Click the **Annotate** button to start the **Human Annotation** task.

If you select any of the documents in the list, the **Document Annotation** panel will be displayed. Since we previously imported the corpus documents, the entity and relationship annotations are already completed (as shown in the following examples). You can annotate mentions (occurrences of words/phrases which can be annotated as an entity) to play around, or you can modify one by annotating mentions with a different entity.

### 7.2 Submit Annotation Set

From the **Task** details panel, press the **Submit All Documents** button.

All documents should change status to **Completed**.

Press the blue "File" icon to toggle back to the **Task** panel, which will show the completion percentage for each task.

From the **Access & Tools -> Documents** panel, select the **Task** tab and select the task to view the details panel.

Select your **Annotation Set Name** and then press the **Accept** button. This step is required to ensure that the annotation set is considered **ground truth**.

> NOTE: The objective of the annotation project is to obtain ground truth, the collection of vetted data that is used to adapt WKS to a particular domain.

**Status** should now be set to **COMPLETED**.

## 8. Create the model

Go to the **Model Management -> Performance** panel, and press the **Train and evaluate** button.

From the **Document Set** name list, select the **Annotation Set Name** you created previously and press the **Train & Evaluate** button.

This process may take several minutes to complete. Progress will be shown in the upper right corner of the panel.

> Note: In practice, you would create separate annotation sets (each containing thousands of messages) for training and evaluation.

Once complete, you will see the results of the train and evaluate process.

You can view the log files of the process by clicking the **View Log** button.

## 9. Deploy the machine learning model to Watson Discovery

Now we can deploy our new model to the already created **Watson Discovery** service. Navigate to the **Version** menu on the left and press **Take Snapshot**.

The snapshot version will now be available for deployment to Watson Discovery.

To start the process, click the **Deploy** button associated with your snapshot version.

Select the option to deploy to **Discovery**.

Then enter your IBM Cloud account information to locate your **Discovery** service to deploy to.

Once deployed, a **Model ID** will be created. Keep note of this value as it will be required later in this Code Pattern.

> NOTE: You can also view this **Model ID** by pressing the **Discovery** button listed with your snapshot version.

### 10. Load the Discovery files

Launch the **Watson Discovery** tool. Create a **new data collection**
and give the data collection a unique name.

<p align="center">
  <img width="600" src="doc/source/images/create-collection.png">
</p>

From the new collection data panel, under `Configuration` click the `Switch` button to create a new configuration file that will include extracting keywords as a function of data enrichment. Give the configuration file a unique name.

![Create config file](doc/source/images/create-keyword-config.gif)

> Note: failure to do this will result in no `keywords` being shown in the app. 

From the new collection data panel, under `Add data to this collection` use `Drag and drop your documents here or browse from computer` to seed the content with the json files extracted from `data/food_reviews/`.

> Note: If you don't load files, they will be automatically added when you run `npm start`.

![Upload data to collection](doc/source/images/add-docs-to-collection.gif)

> Save the **environment_id** and **collection_id** for your `.env` file in the next step.

### 11. Configure credentials
```
cp env.sample .env
```
Edit the `.env` file with the necessary settings.

#### `env.sample:`

```
# Replace the credentials here with your own.
# Rename this file to .env before starting the app.

# Watson Discovery
DISCOVERY_USERNAME=<add_discovery_username>
DISCOVERY_PASSWORD=<add_discovery_password>
DISCOVERY_ENVIRONMENT_ID=<add_discovery_environment>
DISCOVERY_COLLECTION_ID=<add_discovery_collection>

# Run locally on a non-default port (default is 3000)
# PORT=3000

```

### 12. Run the application
1. Install [Node.js](https://nodejs.org/en/) runtime or NPM.
1. Start the app by running `npm install`, followed by `npm start`.
1. Access the UI by pointing your browser at `localhost:3000`.
> Note: `PORT` can be configured in `.env`.

# Sample UI layout
 
![](doc/source/images/sample-output.png)

# Troubleshooting

* Error: Environment {GUID} is still not active, retry once status is active

  > This is common during the first run. The app tries to start before the Discovery
environment is fully created. Allow a minute or two to pass. The environment should
be usable on restart. If you used `Deploy to IBM Cloud` the restart should be automatic.

* Error: Only one free environment is allowed per organization

  > To work with a free trial, a small free Discovery environment is created. If you already have a Discovery environment, this will fail. If you are not using Discovery, check for an old service thay you may want to delete. Otherwise use the .env DISCOVERY_ENVIRONMENT_ID to tell the app which environment you want it to use. A collection will be created in this environment using the default configuration.

* Error when loading files into Discovery

  > Loading all 2000 document files at one time into Discovery can sometimes lead to "busy" errors. If this occurs, start over and load a small number of files at a time.

* No keywords appear in the app

  > This can be due to not having a proper configuration file assigned to your data collection. See [Step 3](#3-load-the-discovery-files) above.

# Privacy Notice

If using the `Deploy to IBM Cloud` button some metrics are tracked, the following information is sent to a [Deployment Tracker](https://github.com/IBM/metrics-tracker-service) service on each deployment:

* Node.js package version
* Node.js repository URL
* Application Name (`application_name`)
* Application GUID (`application_id`)
* Application instance index number (`instance_index`)
* Space ID (`space_id`)
* Application Version (`application_version`)
* Application URIs (`application_uris`)
* Labels of bound services
* Number of instances for each bound service and associated plan information

This data is collected from the `package.json` and `repository.yaml` file in the sample application and the ``VCAP_APPLICATION`` and ``VCAP_SERVICES`` environment variables in IBM Cloud and other Cloud Foundry platforms. This data is used by IBM to track metrics around deployments of sample applications to IBM Cloud to measure the usefulness of our examples, so that we can continuously improve the content we offer to you. Only deployments of sample applications that include code to ping the Deployment Tracker service will be tracked.

## Disabling Deployment Tracking

To disable tracking, simply remove `require("metrics-tracker-client").track();` from the ``index.js`` file in the ``server`` directory.

# Links

* [Demo on Youtube](https://www.youtube.com/watch?v=todo): Watch the video
* [Watson Node.js SDK](https://github.com/watson-developer-cloud/node-sdk): Download the Watson Node SDK.

# Learn more

* **Artificial Intelligence Code Patterns**: Enjoyed this Code Pattern? Check out our other [AI Code Patterns](https://developer.ibm.com/code/technologies/artificial-intelligence/).
* **AI and Data Code Pattern Playlist**: Bookmark our [playlist](https://www.youtube.com/playlist?list=PLzUbsvIyrNfknNewObx5N7uGZ5FKH0Fde) with all of our Code Pattern videos
* **With Watson**: Want to take your Watson app to the next level? Looking to utilize Watson Brand assets? [Join the With Watson program](https://www.ibm.com/watson/with-watson/) to leverage exclusive brand, marketing, and tech resources to amplify and accelerate your Watson embedded commercial solution.

# License
[Apache 2.0](LICENSE)
