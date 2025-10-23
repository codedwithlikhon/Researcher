"use client"

interface MarkdownProps {
  children: string
}

export function Markdown({ children }: MarkdownProps) {
  // Simple markdown rendering - converts basic markdown to HTML
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br />")
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(children) }} className="prose prose-sm dark:prose-invert" />
  )
}
