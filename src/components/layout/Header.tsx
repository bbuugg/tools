import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-14 shrink-0 bg-white/80 backdrop-blur-sm">
      <div className="flex h-full items-center gap-4 px-4">
        
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
