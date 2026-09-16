// Saving a pilot inquiry. The site is static, so the browser writes straight to Supabase.
// The table is insert-only for this key (see supabase/graymatter_inquiries.sql): it can add a
// lead but can never read, change or delete one. Leads are read in the Supabase dashboard.
const URL_BASE = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const KEY = import.meta.env.VITE_SUPABASE_KEY || "";

const SIZES = ["1–24", "25–50", "51–100", "101–300", "301+"];

export type InquiryInput = { name: string; email: string; company: string; size: string; workflow: string; consent: boolean; website?: string };

export async function saveInquiry(input: InquiryInput): Promise<string> {
  const name = input.name?.trim() ?? "", email = input.email?.trim().toLowerCase() ?? "";
  const company = input.company?.trim() ?? "", workflow = input.workflow?.trim() ?? "";
  if (input.website) throw new Error("Unable to accept this submission.");
  if (name.length < 2 || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      company.length < 2 || company.length > 160 || !SIZES.includes(input.size) ||
      workflow.length < 10 || workflow.length > 2000 || input.consent !== true)
    throw new Error("Please enter your name, a valid email, firm, team size and a brief description of the document (at least 10 characters), and agree to be contacted.");
  if (!URL_BASE || !KEY) throw new Error("The form is not connected yet. Please email hello@graymatterai.in and we'll pick it up from there.");

  const reference = "GM-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const res = await fetch(`${URL_BASE}/rest/v1/graymatter_inquiries`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ reference, name, email, company, team_size: input.size, workflow, consent: true, source: "website" }),
  });
  if (!res.ok) throw new Error("Your inquiry could not be saved. Please try again, or email hello@graymatterai.in.");
  return reference;
}
