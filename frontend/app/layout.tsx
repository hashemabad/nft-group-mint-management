import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "OIL GODS Mint",
  description: "Mint OIL GODS on Base"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
