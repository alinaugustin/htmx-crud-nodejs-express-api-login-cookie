# HTMX Login App

This project is a simple login application built with Node.js, Express, and HTMX. It demonstrates how to handle user authentication with cookies and dynamic page updates.

## Project Structure

```
htmx-login-app
├── src
│   ├── controllers
│   │   └── authController.js
│   ├── routes
│   │   └── authRoutes.js
│   ├── views
│   │   └── login.html
│   └── app.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd htmx-login-app
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables. For example:
   ```
   SESSION_SECRET=your_secret_key
   ```

## Usage

1. Start the application:
   ```
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000` to access the login page.

## Features

- User authentication with session management using cookies.
- Dynamic form submission and page updates using HTMX.
- Simple and clean project structure for easy navigation and understanding.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project. 

## License

This project is licensed under the MIT License.