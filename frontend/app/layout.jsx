// frontend/app/layout.jsx
import './globals.css';

export const metadata = {
  title: 'Gym Credit Token System',
  description: 'A blockchain-based system for gym credit management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}