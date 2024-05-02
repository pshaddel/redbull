### Technologies
#### Typescript
It gives us some benefits like:
- Type checking
- Less error-prone
- Easier to refactor
- Less Bugs

#### ESLint
It helps us to keep the code clean and consistent. Also by using plugins like security, we can avoid some common security issues.

#### Jest
It is not the fastest testing framework but it is quite mature and I am running the tests using @swc/jest which is a fast runner written in Rust.

#### Database
I am going to use MongoDB for storing user and the user's faviorite contents. The Data is quite simpel and it does not make a big difference if we use sql or nosql.
We have two schemas:
- User
- UserFavoriteContent
We could store the faviorite content in the user schema(quite poopular in nosql dbs) but I decided to create a separate schema for it because it is more scalable and we can easily add more features in the future.

#### Express
It is probably not as fast as fastify and some other libraries but it is very mature and has a big community. Also, it is quite easy to use and has a lot of plugins.

#### Swagger
Instead of using postman or other tools, we can use swagger to have documenation, also we have a kind of versioning in the documentation.

#### Zod
It is a schema validation library. It is quite easy to use and has a lot of features.

#### Cache
Since we have to make calls to  https://pixabay.com/api/docs/ we can use a cache to store the results. We can use redis for this to make it faster and cheaper.
Use a Correct Namespace and Wrapper for using Caching mechanism. Implement a Memo Function to cache the results of the API.

### Architecture
I am going to use a Modular Monolith architecture. It is quite easy to start with and we can easily split the modules into microservices in the future. Also, it is easier to deploy and maintain.
We are going to have one module for the user. It is going to have the following layers:
- Route
- Service
- Model

### Authentication
I use JWT for authentication.
Security Concerns:
- For Register we have to send a code to the email of the user to verify the email.(We can store it in redis)
- We should validate data to avoid NoSQL injection.
- Also for other routes we should validate the data.
- We should not give extra errors on unsuccessful login attempts.
- JWT refresh token
- JWT refersh token rotation
- JWT blacklisting
- JWT expiration
- Brute Force Protection
- Rate Limiting
- Secure Cookies(Where we store the JWT token)
- Secure Headers(using helmet)
- Secure CORS(for development we are going to allow all origins but in production, we should only allow the frontend origin)
- Hashing using Argon2id which is the best hashing algorithm for passwords, we are also using a salt.
- For our Login page we have to use a CSRF token to prevent CSRF attacks.
- We are going to use HTTPS in production.


### Error Handling

### HTTP Status Codes

### Logging

### Retry for Third Party Services

### Frontend Use Debunce for Search

### Monitoring?

### Typedoc for documenting the code
