# MusCo Store

This project ...
Structure:
*FE - React and SCSS
*BE - NodeJS and Express
*Database - MongoDB
*State Management - Redux Toolkit
*Image Storage - Cloudinary
*Email - Nodemailer | SendGrid
*FE Deployment - Vercel
*Be Deployment - Render
\*First BE than FE Development

## Installation

To install the project, you need to have the following tools installed:
`npm init -y`
`npm install express`
`npm install nodemon`
`npm install mongoose`
`npm install dotenv`
`npm install cors`
`npm install bcrypt`
`npm install jsonwebtoken`
`npm install express-async-errors`
`npm install express-validator`
`npm install multer`
`npm install nodemailer`
`npm install swagger-ui-express`
`npm install swagger-autogen`
`npm install redoc-express`
`npm install morgan`

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

9. Frontend Installations:
   `npm create vitea@latest`
   `npm install rechart react-icons`
   `npm install @tailwindcss/forms`
