import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";

async function insertTestUser() {
  try {
    await auth.api.signUpEmail({
      body: {
        name: "test user",
        email: "test@mail.com",
        password: "password123",
      },
    });
    console.log("user successfully inserted");
  } catch (e) {
    if (e instanceof APIError) {
      console.log(e.message, e.status);
    } else {
      console.error("Error:", e);
    }
  }
}

insertTestUser()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
