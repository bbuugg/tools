import { useState } from "react";
import { useNavigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { Search, Sparkles } from "lucide-react";

import { allTools } from "@/utils/toolList";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const [searchTerm, setSearchTerm] = useState("");

  const searchLower = searchTerm.toLowerCase();
  const filteredTools = allTools
    .map((tool) => ({
      ...tool,
      translatedName: intl.formatMessage({ id: `tools.${tool.id}.name`, defaultMessage: tool.name }),
      translatedDesc: intl.formatMessage({ id: `tools.${tool.id}.description`, defaultMessage: tool.description }),
      translatedCategory: intl.formatMessage({ id: `common.category.${tool.category}`, defaultMessage: tool.category }),
    }))
    .filter(
      (tool) =>
        tool.translatedName.toLowerCase().includes(searchLower) ||
        tool.translatedDesc.toLowerCase().includes(searchLower) ||
        tool.translatedCategory.toLowerCase().includes(searchLower)
    );

  return (
    <div className="mx-auto max-w-7xl">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-[0_10px_40px_rgba(16,185,129,0.25)]">
            <Sparkles className="size-8" />
          </div>
        </div>
        
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          <FormattedMessage id="home.title" />
        </h1>
        
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          <FormattedMessage id="home.subtitle" />
        </p>

        {/* Search Bar */}
        <div className="mx-auto max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={intl.formatMessage({ 
                id: "home.searchPlaceholder",
                defaultMessage: "搜索工具..."
              })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 rounded-2xl border-border/60 bg-background/80 pl-12 pr-4 text-base shadow-sm transition-shadow focus-visible:shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => (
          <Card
            key={tool.id}
            className={cn(
              "group cursor-pointer overflow-hidden rounded-2xl border-border/60 transition-all duration-200",
              "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
              "active:scale-[0.98]"
            )}
            onClick={() => navigate(tool.path)}
          >
            <CardHeader className="space-y-3 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl transition-transform group-hover:scale-110">
                  {tool.icon}
                </div>
                <Badge 
                  variant="secondary" 
                  className="shrink-0 rounded-lg bg-primary/8 text-xs font-medium text-foreground"
                >
                  <FormattedMessage
                    id={`common.category.${tool.category}`}
                    defaultMessage={tool.category}
                  />
                </Badge>
              </div>
              
              <CardTitle className="text-lg font-semibold tracking-tight">
                <FormattedMessage
                  id={`tools.${tool.id}.name`}
                  defaultMessage={tool.name}
                />
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-5">
              <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                <FormattedMessage
                  id={`tools.${tool.id}.description`}
                  defaultMessage={tool.description}
                />
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Search className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            {intl.formatMessage({
              id: "home.noResults",
              defaultMessage: "未找到工具",
            })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {intl.formatMessage({
              id: "home.noResultsDesc",
              defaultMessage: "尝试使用其他关键词搜索",
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
