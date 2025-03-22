# MusCo-Info

## Overview

MusCo Store is a comprehensive stock management and e-commerce platform designed to streamline inventory operations and provide a seamless shopping experience. This document outlines the architecture, directory structure, and setup instructions.

## Architecture

### Frontend

- **Framework:** React
- **Styling:** SCSS, Tailwind CSS
- **State Management:** Redux Toolkit
- **Build Tool:** Vite
- **Routing:** React Router
- **Icons:** React Icons
- **Charts:** Recharts

### Backend

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT) & argon2
- **File Upload:** Multer, Multer-S3, Sharp
- **Error Handling:** Express Async Errors
- **Environment Variables:** dotenv
- **CORS:** cors
- **Email Services:** Nodemailer
- **File/Image Storage:** AWS S3, Firebase Storage
- **Deployment:** AWS EC2
- **Version Control:** Git
- **Documentation:** Markdown

## Important Notes and Considerations

1. Install the project dependencies
2. Create a `.env` file in the root of the project with the following variables:

   - `PORT=8061`
   - `MONGODB=mongodb://...`
   - `JWT_SECRET=your_secret_key`
   - `EMAIL_USER=your_email`
   - `EMAIL_PASS=your_password`
   - `NODE_ENV=production`
   - `ACCESS_KEY=access_key`
   - `SECRET_KEY=secret_key`
   - `REFRESH_KEY=refresh_key`
   - `PAGE_SIZE=20`

3. dbConnection under `src/config/dbConnection.js` is the connection to the database.
   Change the connection string to your own.

4. ERD file is under `src/erdStockAPI.png` is the core element of the project and means Entity Relationship Diagram.
   It is a visual representation of the database schema.
   According to the ERD, the project has 8 collections: - users - tokens - firms - brands - categories - products - purchases - sells

5. Via MVC pattern, the project is divided into 3 main parts and created by the following structure:

   - Models: `src/models`
   - Views: `src/routes`
   - Controllers: `src/controllers`

6. .gitignore is created to ignore the unnecessary files and folders to be pushed to the github repository.
   `https://www.toptal.com/developers/gitignore api node`

7. For the logos `https://logowik.com/` is used.

8. Format Function: The formatPhoneNumber function is defined outside the controller methods.
   This function formats the phone number by replacing + with 00 and removing any non-digit characters.

9. Image Upload: The image upload functionality is implemented using the multer and multer-s3 packages.
   The images are stored in an S3 bucket on AWS.
   The image URL is then saved in the database.

10. Image Storage: The images of the products are stored in firebase storage.
    The image URL is then saved in the database.

11. Cloud-Based Hosting: The application is hosted on AWS EC2.
    The server is running on port 8061.

12. Nodemailer: The application uses Nodemailer to send emails.
    The email service is configured in the `src/config/nodemailer.js` file.
    This process is done for forgot-password and email verification.
    The email is sent to the user with a link to reset the password or verify the email.

13. JWT: The application uses JWT for authentication.
    The JWT secret key is stored in the `.env` file.
    The JWT token is generated when the user logs in and is sent to the client.
    The token is then used to authenticate the user for protected routes.

14. Database: The application uses MongoDB as the database.
    The connection string is stored in the `.env` file.
    The database is hosted on MongoDB Atlas.
    The database is created with the name `muscoStore`.

15. Charts: The application uses Recharts to display charts.
    The charts are displayed on the dashboard.
    The charts show the number of products, purchases, and sells.

16. Full-Stack MERN Project: The application is a full-stack MERN project.
    The frontend is built with React and the backend is built with Node.js and Express.
    The application uses MongoDB as the database.
    The application is deployed on AWS EC2.
    The application is version controlled with Git.

17. Automatic Updates: Via GitHub Actions, the application is automatically updated when a new commit is pushed to the main branch.
    The application is deployed on AWS EC2.
    The application is version controlled with Git.
    The application is built with Vite.

18. Inventory Tracking: The application tracks the inventory of products.
    The application shows the number of products in stock.
    The application shows the number of products sold.
    The application shows the number of products purchased.
    The application shows the number of products in the cart.

19. Fully Responsive: The application is fully responsive.
    The application is built with React and Tailwind CSS.
