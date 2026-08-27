const parseAdminEmails = () => {
  const raw = [
    process.env.ADMIN_EMAILS,
    process.env.NEXT_PUBLIC_ADMIN_EMAILS,
  ]
    .filter((value): value is string => Boolean(value))
    .join(",");

  const values = raw
    .split(/[\s,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);

  return values.length ? values : ["staticisgucci@gmail.com"];
};

export const ADMIN_EMAILS = parseAdminEmails();

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.trim().toLowerCase() === normalizedEmail);
}

export async function isAdmin(supabase: {
  auth: {
    getUser: () => Promise<{
      data: { user: { email?: string | null } | null };
      error: Error | null;
    }>;
  };
} | null): Promise<boolean> {
  if (!supabase) return false;

  const { data, error } = await supabase.auth.getUser();
  if (error) return false;

  return isAdminEmail(data?.user?.email ?? null);
}
