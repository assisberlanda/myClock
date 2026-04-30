"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function PrivacyPolicyPage() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const [pageContent, setPageContent] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      try {
        const fileName = `politica-${locale}`;
        const response = await fetch(`/content/politica/${fileName}.txt`);
        if (response.ok) {
          const content = await response.text();
          setPageContent(content);
        } else {
          const fallbackResponse = await fetch('/content/politica/politica-pt.txt');
          if (fallbackResponse.ok) {
            const content = await fallbackResponse.text();
            setPageContent(content);
          }
        }
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };
    loadContent();
  }, [locale]);

  const formatContent = (content: string) => {
    if (!content) return null;
    const lines = content.split('\n');
    const sections: { title: string | null; type: string; lines: string[] }[] = [];
    let currentSection: { title: string | null; type: string; lines: string[] } = { title: null, type: 'intro', lines: [] };

    const isHeader = (line: string) => {
      const trimmed = line.trim();
      return trimmed.startsWith('# ') || trimmed.startsWith('## ') || /^\d+\./.test(trimmed);
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      if (isHeader(line)) {
        sections.push(currentSection);
        let title = trimmed.replace(/^#+\s*/, '');
        const lowerTitle = title.toLowerCase();
        
        let type = 'section';
        if (lowerTitle.includes('contato') || lowerTitle.includes('contact')) type = 'contact';
        
        currentSection = { title, type, lines: [] };
      } else {
        currentSection.lines.push(line);
      }
    });
    sections.push(currentSection);

    return sections.map((sec, sIdx) => {
      const secContent = sec.lines.join('\n').trim();
      if (!sec.title && !secContent) return null;

      const key = `sec-${sIdx}`;
      const titleEl = sec.title ? <h2 className="text-xl font-bold mb-4 text-foreground">{sec.title}</h2> : null;

      if (sec.type === 'contact') {
        return (
          <div key={key} className="border-t pt-8 mt-8">
            {titleEl}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-8 text-center">
              {sec.lines.map((l, i) => {
                const trimmed = l.trim();
                if (!trimmed) return null;
                
                // Handle Markdown links like [text](mailto:email)
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
                const match = trimmed.match(linkRegex);
                
                if (match) {
                  return (
                    <a key={i} href={match[2]} className="text-2xl font-bold text-green-600 dark:text-green-400 hover:underline block my-4 break-all">
                      {match[1]}
                    </a>
                  );
                }
                
                // If it's just a raw email
                if (trimmed.includes('@') && !trimmed.includes(' ')) {
                   return (
                    <a key={i} href={`mailto:${trimmed}`} className="text-2xl font-bold text-green-600 dark:text-green-400 hover:underline block my-4 break-all">
                      {trimmed}
                    </a>
                  );
                }

                return <p key={i} className="text-green-800 dark:text-green-200 text-base">{trimmed.replace(/\*\*/g, '')}</p>;
              })}
            </div>
          </div>
        );
      }

      const renderLine = (l: string, i: number) => {
        const trimmed = l.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) return <li key={i} className="ml-6 list-disc mb-2 text-muted-foreground">{trimmed.substring(2)}</li>;
        if (trimmed.startsWith('---')) return <hr key={i} className="my-8 border-border-subtle" />;
        
        // Handle Markdown links like [text](mailto:email)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        if (linkRegex.test(trimmed)) {
          const parts = trimmed.split(linkRegex);
          // parts will be [prefix, text, link, suffix]
          return (
            <p key={i} className="text-base leading-relaxed mb-4 text-muted-foreground">
              {parts[0]}
              <a href={parts[2]} className="text-green-600 dark:text-green-400 hover:underline font-bold">
                {parts[1]}
              </a>
              {parts[3]}
            </p>
          );
        }

        const isBoldHighlight = (trimmed.startsWith('**') && trimmed.endsWith('**'));
        const cleanLine = trimmed.replace(/\*\*/g, '');

        if (isBoldHighlight) {
          return (
            <div key={i} className="bg-green-50/50 dark:bg-green-900/10 border-l-4 border-green-500 p-4 my-4">
              <p className="text-green-900 dark:text-green-300 font-semibold text-base">{cleanLine}</p>
            </div>
          );
        }
        return <p key={i} className="text-base leading-relaxed mb-4 text-muted-foreground">{cleanLine}</p>;
      };

      return (
        <div key={key} className={sec.title ? "border-t pt-8 mt-8" : "mb-6"}>
          {titleEl}
          <div className="space-y-1">
            {sec.lines.map((l, i) => renderLine(l, i))}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 md:py-10 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Política de Privacidade</h1>
        <div className="h-1 w-20 bg-green-600 rounded-full"></div>
      </div>
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 md:p-6">
          {pageContent ? formatContent(pageContent) : <p className="text-center py-12 text-muted-foreground italic">Loading content...</p>}
        </CardContent>
      </Card>
    </div>
  );
}
