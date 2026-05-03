import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "LitRecommend - Інтелектуальна система підбору літератури",
  description: "Знайдіть ідеальні книги з допомогою штучного інтелекту. Персоналізовані рекомендації літератури на основі ваших уподобань та настрою.",
  keywords: "книги, рекомендації, література, ChatGPT, штучний інтелект, читання, бібліотека",
  authors: [{ name: "LitRecommend Team" }],
  openGraph: {
    title: "LitRecommend - Інтелектуальна система підбору літератури",
    description: "Знайдіть ідеальні книги з допомогою штучного інтелекту",
    type: "website",
    locale: "uk_UA",
  },
  twitter: {
    card: "summary_large_image",
    title: "LitRecommend - Інтелектуальна система підбору літератури",
    description: "Знайдіть ідеальні книги з допомогою штучного інтелекту",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeScript = `
  (function() {
    function initTheme() {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute('data-theme', theme);
      
      // Set theme-color meta tag
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      const themeColor = theme === 'dark' ? '#1f2937' : '#ffffff';
      
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeColor);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = themeColor;
        document.head.appendChild(meta);
      }
      
      // Save theme if it wasn't saved before
      if (!savedTheme) {
        localStorage.setItem('theme', theme);
      }
    }
    
    // Initialize immediately
    initTheme();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    });
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
