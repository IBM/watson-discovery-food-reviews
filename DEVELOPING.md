# Project Structure

Below is a general overview of the most important directories and files in the project.

```
├── env.sample # Sample environment variable files that needs to be copied to .env file
├── app.js # Entry point of the application
├── manifest.yml # Configuration used to deploy app to IBM Cloud
├── package.json # Config file containing dependencies and scripts and babel config
├── data # Contains data files used by this code pattern
│   └── food_reviews
│       └── *.json # Food review JSON files
├── lib # library and utility functions
│   ├── utils.js # Utility functions/constants used by src and server code
│   └── watson-discovery-setup.js # Functions to auto-load data files into Discovery
├── public # Public folder contains CSS and JS served on the webpage
│   ├── css
│   ├── images
│   └── js
│       └── bundle.js # Entry point for code run in the browser
├── server # Contains code specific to the server
│   ├── express.js # File that configures express
│   ├── index.js # Configures the endpoint for Discovery API and create express server
│   ├── query-builder.js # Helper file that generates the search query params passed to Discovery API
│   ├── query-builder-custom.js # Like query-builder, but for custom and sample queries.
│   └── watson-discovery-service.js # Helper file to promisify Waston SDK APIs
├── src # Views that get rendered by the server and the client bundle.js
│   ├── index.js # HTML view that is rendered
│   ├── main.js # Main component of view which is rendered as HTML server side and contains client side code
│   ├── components # UI components
│   |   └── FilterBase # Base component for all filter objects
│   │   │    ├── FilterContainer # Base component for all filter continers
│   │   │    └── FilterItem # Base component for all filter items
│   │   ├── CategoriesFilter # Filter Component that contains Category items
│   │   ├── CommonQueryPanel # Tab Panel allowing user to run sample queries
│   |   ├── ConceptsFilter # Filter Component that contains Concept items
│   │   ├── CustomQueryPanel # Tab Panel allowing user to run custom queries
│   |   ├── EntitiesFilter # Filter Component that contains Entity text items
│   |   ├── KeywordsFilter # Filter Component that contains Keyword items
│   |   ├── EntityTypesFilter # Filter Component that contains Entity type items
│   |   ├── Matches # Component that display all search results
│   |   ├── PaginationMenu # Component the displays a menu to page through search results
│   |   ├── SearchField # Component that allows the user to specify the search string
│   |   └── SentimentChart # Component that displays a donut chart to visualize sentiment of results
│   └── layouts # Layout for page
│       └── default.js
├── test # Jest test files
├── tools # Contains utility apps
│   └── csv_to_json.txt # Notes and original script/cmds to build JSON from big CSV.
```
