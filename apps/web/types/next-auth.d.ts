import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      weightUnit: string
    } & DefaultSession["user"]
  }
}
