import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TOOL_CATEGORIES } from "@/lib/routes";

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-10">
        {TOOL_CATEGORIES.map((category) => {
          return (
            <div key={category.name}>
              <div className="mb-4 flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
                <span className="text-sm text-muted-foreground">({category.tools.length})</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.href}
                      to={tool.href}
                      className="group relative rounded-xl bg-muted p-6 transition-all hover:bg-accent"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${tool.color} text-white`}
                        >
                          <Icon className="size-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-semibold text-foreground">
                              {tool.title}
                            </h3>
                            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                          </div>
                          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
