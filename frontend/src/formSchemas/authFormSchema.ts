import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const SignUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  invitationCode: z.string().optional(),
  profileImage: z
    .any()
    .refine(
      (file) => {
        if (!file) return true; // optional
        if (file instanceof FileList && file.length > 0) return true;
        return false;
      },
      { message: "Profile image must be a file" }
    )
    .optional(),
});