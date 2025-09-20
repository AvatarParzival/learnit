import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}