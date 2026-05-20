import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { comparePassword } from "@/libs/auth";
import db_Config from "./Db_Conifg";
import User from "./models/usermodel";
export const authOptions: NextAuthOptions = {
  // 1. Providers define karte hain ke login kin tareeqon se ho sakta hai (Google, GitHub, ya Email)
  providers: [
    CredentialsProvider({
      name: "Credentials", // Login form ka title
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // 2. Ye function tab chalta hai jab user login button dabata hai
      async authorize(credentials) {
        // Step A: Database se connection lazmi hai har request par
        await db_Config();

        // Step B: User ko email ke zariye database mein dhundna
        const user = await User.findOne({ email: credentials?.email });

        // Step C: Agar user nahi mila toh error throw karna
        if (!user) throw new Error("Invalid Email or Password");

        // Step D: User ke enter kiye hue password ko database wale hashed password se compare karna
        const isMatch = await comparePassword(
          credentials!.password,
          user.password,
        );

        // Step E: Agar password match nahi karta toh error
        if (!isMatch) throw new Error("Invalid Email or Password");

        // Step F: Agar sab sahi hai, toh user ka data return karna (Ye data JWT token mein chala jayega)
        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  // 3. Callbacks functions hotey hain jo login ke baad data modify karne ke liye use hotay hain
  callbacks: {
    // JWT function tab chalta hai jab token create ya update hota hai
    async jwt({ token, user }) {
      // Agar user login hua hai, toh uski 'role' database se nikaal kar token mein daal do
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }

      return token;
    },
    // Session function tab chalta hai jab hum front-end par 'useSession()' call karte hain
    async session({ session, token }) {
      // Token se 'role' nikaal kar session object mein daal do taake front-end par role dikh sakay
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  // 4. Session strategy 'jwt' matlab data browser ke cookies mein encrypted token ki surat mein save hoga
  session: { strategy: "jwt" },
  // 5. Secret key jo token ko encrypt karne ke liye zaroori hai (.env file mein honi chahiye)
  secret: process.env.NEXTAUTH_SECRET,
};
