import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Use the connection string directly with proper escaping
          const mongodbUri = "mongodb+srv://zeeshanhamid17:%24zee03052002@cluster0.aqabk0o.mongodb.net/";
          const client = await MongoClient.connect(mongodbUri);
          const db = client.db("travel_booking");
          const usersCollection = db.collection("users");
          
          const user = await usersCollection.findOne({ email: credentials.email });
          
          if (!user) {
            client.close();
            throw new Error("Wrong email or password");
          }
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            client.close();
            throw new Error("Invalid password");
          }
          
          client.close();
          
          return { 
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin || false
          };
        } catch (error) {
          console.error("NextAuth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your_nextauth_secret_key",
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/signup",
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions); 