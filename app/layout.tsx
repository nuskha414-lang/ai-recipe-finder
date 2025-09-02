import "./globals.css";

export const metadata = {
  title: "AI Recipe Finder",
  description: "Answer a few questions and get a recipe from ChatGPT or an official YouTube video",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
