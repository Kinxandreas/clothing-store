export default function Footer() {
  return (
    <footer className="border-t border-brand-200 py-10 px-6 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-brand-300">
        <p className="font-display font-bold text-brand-800">KSTORE</p>
        <p>© {new Date().getFullYear()} KSTORE. All rights reserved.</p>
      </div>
    </footer>
  );
}
