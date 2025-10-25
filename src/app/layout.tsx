import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import SessionProvider from "@/components/auth/session-provider";
import GlobalThemeToggle from "@/components/theme/global-theme-toggle";

export const metadata: Metadata = {
  title: "HapiBara",
  description: "Your one-stop solution for all your needs",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <GlobalThemeToggle />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
