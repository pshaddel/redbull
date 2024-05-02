## OBJECTIVE & FOCUS
### Objective
- Develop a backend system with an optional basic frontend to interact with the Pixabay API.
- The code should reflect the Functional and Technical Requirements, thus attention to detail is
paramount.
### Focus
- Emphasize backend development skills, including API integration, database management, and secure user handling.
- You should demonstrate more than just the ability to complete the task's requirements.
- You must demonstrate how you write software professionally. This means writing clean, easy to follow,
appropriately commented code that you would expect to see in a production environment. Demonstrate to us the quality you are committed to every day.
Frontend
- Optional, basic functionality to demonstrate backend features.

## REQUIREMENTS
### User Authentication
- Secure handling and storage of user credentials. Basic Authentication
system for login and registration.
- Username is a valid email
- Password contains at least 8 characters and a combination of lowercase,
uppercase, number and a special character
Examples
- Valid usernames: peter@microsoft.com, steve.creek@mydomain.net
- see https://blogs.msdn.microsoft.com/testing123/2009/02/06/email-
address-test-cases/
- Valid passwords: “Aa11%$cccc”, “g$jkKK44Q!” Expected Result
- Users should be able to login using their registered credentials.
- Credentials should be securely stored.
- The system should validate user credentials and return an authentication
token or error message accordingly.

### Search Feature
#### Use the following API https://pixabay.com/api/docs/
#### Users should be able to search for photos or videos using keywords. The backend fetches from Pixabay’s API and returns them in a structured format.
##### Expected Result
- Upon receiving a keyword search, the backend should query Pixabay’s API effectively with those keywords.
- The system should handle API responses and format the data to send to the frontend.
- Search results should be returned in a paginated format or with infinite scrolling options to manage large datasets.
### Favorite Content
#### Implement backend logic to allow users to mark/unmark content as favorites.
These preferences are stored in the database associated with their user. Provide an endpoint to retrieve a user’s favorites.
Expected Result
- Users can select and deselect photos or videos as favorites, with each action updating the database in real-time.
- Favorited content should be linked uniquely to a user.
- The system should provide a fast and reliable endpoint for users to view their
favorited content.

## Backend Technologies
### Choose a robust backend framework. Build RESTful APIs for user
management, searching photos or videos, and managing favorites.
Expected Result
- The chosen framework should facilitate rapid development and easy integration of <b>RESTful</b> services.
- APIs should adhere to <b>REST principles and best practices</b>.
- APIs should handle requests and responses in a secure <b>efficient</b> manner,
- including <b>proper status codes</b> and <b>data validation.</b>
### Database
#### Use a database to store user data and favorites. Design the schema to support efficient data retrieval.
Expected Result
- The database should be properly structured to ensure efficient queries.
- Relationships between users and their favorite content should be clearly defined, with integrity constraints in place to maintain data consistency.

## Optional Frontend (Basic)
##### A simple frontend that can be as basic as a series of HTML forms and lists to test the functionality of the backend. No elaborate designs or responsive layouts are required.
Expected Result
- The frontend should provide a basic form for login, and a simple interface for searching and favoriting photos or videos.
- It should be able to display search results and favorites.
- It should function across different browsers at a basic l

## Portability: Containerization
### Ensure that the backend application is containerized using Docker, which facilitates deployments and ensures that it runs consistently across different environments.
Expected Result
- A Dockerfile should be included in the project to build the backend application.
- The application should be fully operational within a Docker container, encapsulating all dependencies.