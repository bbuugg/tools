import { Github } from "lucide-react"

import { Button } from "@/components/ui/button"

/** 项目仓库地址 */
export const GITHUB_REPO_URL = "https://github.com/bbuugg/tools"

export function GithubLink() {
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      asChild
      aria-label="在 GitHub 上打开本项目"
      title="在 GitHub 上打开本项目"
    >
      <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer noopener">
        <Github className="size-[18px]" />
        <span className="sr-only">GitHub 仓库</span>
      </a>
    </Button>
  )
}
