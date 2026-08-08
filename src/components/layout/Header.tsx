import { Link, useLocation } from "react-router-dom";
import { Wrench, Home as HomeIcon } from "lucide-react";

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 h-14 shrink-0 bg-white/80 backdrop-blur-sm">
      <div className="flex h-full items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
            <Wrench className="size-4" />
          </div>
          <span className="text-lg font-bold text-gray-900">工具站</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isHome
                ? "bg-primary/10 text-primary"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <HomeIcon className="size-4" />
            首页
          </Link>
        </nav>
      </div>
    </header>
  );
}
