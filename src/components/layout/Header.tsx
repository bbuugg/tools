import { Link } from "react-router-dom";
import { Wrench, Menu } from "lucide-react";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-50 h-14 shrink-0 bg-white/80 backdrop-blur-sm">
      <div className="flex h-full items-center gap-4 px-4">
        <button
          onClick={onMenuClick}
          className="flex size-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
          aria-label="打开菜单"
        >
          <Menu className="size-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
            <Wrench className="size-4" />
          </div>
          <span className="text-lg font-bold text-gray-900">工具站</span>
        </Link>
      </div>
    </header>
  );
}
