# Spotify Analyzer

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Getting started

### Setting up the workspace
Start by opening a terminal in your workspace. 

**[IMPORTANT: It is required to have Java version 21 and the latest NodeJS and Maven installed.]**

To install Maven, please download the binary from the maven repository. Add MAVEN_HOME into your OS environment variables with the reference pointing to the mvn folder you downloaded. Also, add MAVEN_HOME to the Path variable with it pointing to the binaries folder within the download. Furthermore, add MAVEN_HOME to your IDE's environment variables.

1. Clone repo with ```gh repo clone https://github.com/colehdlr/SpotifyAnalyzer```
2. Get dependecies for Spring Boot and React by running from root directory: ```cd spotify-analyzer && npm install && cd ../spotify-analyzer && npm install```.


### Running the environment

It is recommended to use split terminal on preferred IDE to view terminal outputs for both Spring Boot and React.

To run the project:
1. Install Maven dependencies - ```mvn clean install```
2. Start the backend by running: ```cd backend && mvn spring-boot:run```.
3. IN A DIFFERENT TERMINAL INSTANCE, start the frontend by running: ```cd spotify-analyzer && npm start```.


### Developing

Create a new branch to develop on.
Run ```git checkout -b development-YOURNAME```.


When you've made changes and are ready to push:
1. Commit your latest changes.
2. Run (Make sure to add your name): ```git switch main && git pull && git switch development-YOURNAME && git pull```.
3. Create a code review: ```gh pr create --web```. If this fails setup [```gh```](https://docs.github.com/en/github-cli/github-cli/quickstart).


### Common Errors
Please add any errors that were faced in setting up the environment and how they were resolved.
