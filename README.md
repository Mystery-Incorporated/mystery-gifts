<h1 align="center">Welcome to Mystery Inc Gifts</h1>
<p>
  <img alt="GitHub release (latest by date including pre-releases)" src="https://img.shields.io/github/v/release/Mystery-Incorporated/mystery-gifts?include_prereleases" >

  <a href="https://github.com/Mystery-Incorporated/mystery-gifts/wiki" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>

  <a href="https://github.com/Mystery-Incorporated/mystery-gifts/blob/master/LICENSE.md" target="_blank">
    <img alt="License: Mozilla Public License 2.0" src="https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg" />
  </a>
</p>

> A full-stack web application for a manageply public gift wishlist system for members.

### 🏠 [Homepage](https://github.com/Mystery-Incorporated/mystery-gifts)

## Directory Structure

```
.
├── ./.github
├── ./
├── ├── __mocks__/ (any file type to mock)
│   ├── apis/
│   │   └── <all server apis>
│   ├── application/ (reactjs)
│   │   ├── media/
│   │   │   └── <all frontend assets>
│   │   ├── public/
│   │   └── src/
│   ├── models/
│   │   └── <db schemas>
│   ├── tests/
│   │   ├── controllers/
│   │   │   └── <all test controllers>  
│   │   ├── data/
│   │   │   └── <all test data> 
│   │   └── <backend tests>.js
│   ├── .babelrc
│   ├── .env.template
│   ├── package-lock.json
│   ├── package.json
│   ├── server-utils.js
│   ├── server.js
│   └── webpack.config.js
├── ./.gitignore
├── ./Code_OF_CONDUCT.md
├── ./LICENSE.md
└── ./README.md
```

## MongoDB Setup 

1. This project is created with MongoDb Cloud. Create your own project/cluster [here](https://www.mongodb.com/cloud) for testing purposes.
2. Make acopy and rename `mystery-gifts/.env.template` to  `mystery-gifts/.env`
3. Edit the all fields in `< ... >` with your mongo cluster information.

## .env Setup
> Make acopy and rename `mystery-gifts/.env.template` to  `mystery-gifts/.env` and Edit the all fields in `< ... >`.

```sh
# MongoDB connection URL
DB_HOST=mongodb+srv://<user>:<password>@<cluster url>/<DB name>?retryWrites=true
# Application secret for token generation and verification
SECRET=<secret>
# Gmail user and pass for sending verification emails for new users
MAIL_USER=<email username>
MAIL_PASS=<email password>
```

## Available commands

```sh
# install all prerequisites
npm install 
# compile and bundle all source code
npm run build
# start the main backend server with build files
npm start 
# start the react dev server
npm run dev 
# run both backend and frontend tests
npm run test 
# run frontend tests
npm run test-frontend 
# run backend tests
npm run dev 
```

## Authors

👤 **Kalindu De Costa**

* Website: http://kdecosta.com/
* Github: [@kalindudc](https://github.com/kalindudc)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Mystery-Incorporated/mystery-gifts/issues). 

Note: All PRs must pass existing unit tests and if any new features are introduced, please add necessary unittests.

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [Kalindu De Costa](https://github.com/kalindudc).<br />
This project is [Mozilla Public License 2.0](https://github.com/Mystery-Incorporated/mystery-gifts/blob/master/LICENSE.md) licensed.

***
_This README was generated and derived with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_