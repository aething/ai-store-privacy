import { apiRequest } from "./queryClient";

export async function sendVerificationEmail(email: string): Promise<{ token: string }> {
  const response = await apiRequest("POST", "/api/users/send-verification", { email });
  return response.json();
}

export async function verifyEmail(token: string, userId: number): Promise<{ isVerified: boolean }> {
  const response = await apiRequest("GET", `/api/users/${userId}/verify?token=${token}`);
  return response.json();
}
