import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PetVet - Pet Veterinary Record Management",
  description: "Manage your pets' veterinary records with ease. Track appointments, medications, and health history.",
  keywords: ["pet", "veterinary", "health", "records", "management"],
  authors: [{ name: "PetVet Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
