const argon2 = require("argon2");

async function testArgon2() {
  try {
    const password = "yourPassword"; // Replace with the password you want to test
    console.log("Original password:", password);

    // Hash the password
    const hash = await argon2.hash(password);
    console.log("Hashed password:", hash);

    // Verify the password
    const isVerified = await argon2.verify(hash, password);
    console.log("Password verified:", isVerified);
  } catch (error) {
    console.error("Error testing Argon2:", error);
  }
}

testArgon2();
