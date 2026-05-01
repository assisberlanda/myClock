"use client";

import { useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { loadLegalContent } from "@/shared/i18n/legalContent";

export default function AboutPage() {
  const locale = useLocale();
  const [aboutContent, setAboutContent] = useState("");

  useEffect(() => {
    const loadAboutContent = async () => {
      const content = await loadLegalContent(locale, "sobre");
      setAboutContent(content);
    };
    loadAboutContent();
  }, [locale]);

  const formatContent = (content: string) => {
    if (!content) return null;
    const lines = content.split('\n');
    const sections: { title: string | null; type: string; lines: string[] }[] = [];
    let currentSection: { title: string | null; type: string; lines: string[] } = { title: null, type: 'intro', lines: [] };

    const isHeader = (line: string) => {
      const trimmed = line.trim();
      return trimmed.startsWith('# ') || trimmed.startsWith('## ') || 
             (trimmed.toLowerCase().includes('important') && trimmed.length < 30) ||
             (trimmed.toLowerCase().includes('privac') && trimmed.length < 40) ||
             (trimmed.toLowerCase().includes('support') && trimmed.length < 30);
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      if (isHeader(line)) {
        sections.push(currentSection);
        const title = trimmed.replace(/^#+\s*/, '');
        const lowerTitle = title.toLowerCase();
        
        let type = 'default';
        if (line.trim().startsWith('# ')) type = 'main-title';
        else if (lowerTitle.includes('versão') || lowerTitle.includes('version')) type = 'version';
        else if (lowerTitle.includes('important')) type = 'important';
        else if (lowerTitle.includes('privacidade') || lowerTitle.includes('privacy') || lowerTitle.includes('gdpr') || lowerTitle.includes('proteção')) type = 'privacy';
        else if (lowerTitle.includes('suporte') || lowerTitle.includes('support') || lowerTitle.includes('contato')) type = 'support';
        
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
      const titleEl = sec.title && sec.type !== 'main-title' ? <h2 className="text-xl font-semibold mb-4">{sec.title}</h2> : null;

      const renderLine = (l: string, i: number) => {
        const trimmed = l.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) return <li key={i} className="ml-6 list-disc mb-2 text-muted-foreground">{trimmed.substring(2)}</li>;
        
        const cleanLine = trimmed.replace(/\*\*/g, '');
        const isBoldHighlight = (trimmed.startsWith('**') && trimmed.endsWith('**'));

        if (isBoldHighlight && sec.type !== 'main-title' && sec.type !== 'version' && sec.type !== 'support') {
          let bgColor = "bg-gray-50 dark:bg-gray-800/50";
          let textColor = "text-foreground";
          if (sec.type === 'important') { bgColor = "bg-yellow-50 dark:bg-yellow-900/20"; textColor = "text-yellow-800 dark:text-yellow-200"; }
          if (sec.type === 'privacy') { bgColor = "bg-green-50 dark:bg-green-900/20"; textColor = "text-green-800 dark:text-green-200"; }
          
          return (
            <div key={i} className={`${bgColor} border border-transparent rounded-lg p-4 my-2`}>
              <p className={`${textColor} font-bold text-base`}>{cleanLine}</p>
            </div>
          );
        }
        return <p key={i} className="text-base leading-relaxed mb-4 text-muted-foreground">{cleanLine}</p>;
      };

      if (sec.type === 'main-title') {
        return (
          <div key={key} className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 mb-2">{sec.title}</h1>
            <div className="h-1 w-20 bg-blue-600 rounded-full mb-6"></div>
            {sec.lines.map((l, i) => renderLine(l, i))}
          </div>
        );
      }

      if (sec.type === 'version') {
        const infoLines = sec.lines.filter(l => l.trim() && l.includes(':'));
        const textLines = sec.lines.filter(l => l.trim() && !l.includes(':'));

        return (
          <div key={key} className="border-t pt-8 mt-8">
            {titleEl}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {infoLines.map((l, i) => {
                const parts = l.split(':');
                const keyLabel = parts[0].replace(/\*\*/g, '').trim();
                const valueLabel = parts.slice(1).join(':').replace(/\*\*/g, '').trim();
                
                return (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                      {keyLabel}
                    </p>
                    <p className="text-base font-semibold">
                      {valueLabel}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="space-y-4">
              {textLines.map((l, i) => renderLine(l, i))}
            </div>
          </div>
        );
      }

      if (sec.type === 'important') {
        return (
          <div key={key} className="border-t pt-8 mt-8">
            <h2 className="text-xl font-semibold mb-4 text-red-600">{sec.title}</h2>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
              {sec.lines.map((l, i) => renderLine(l, i))}
            </div>
          </div>
        );
      }

      if (sec.type === 'privacy') {
        return (
          <div key={key} className="border-t pt-8 mt-8">
            {titleEl}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              {sec.lines.map((l, i) => renderLine(l, i))}
            </div>
          </div>
        );
      }

      if (sec.type === 'support') {
        return (
          <div key={key} className="border-t pt-8 mt-8 text-center">
            {titleEl}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-8">
              {sec.lines.map((l, i) => {
                if (l.includes('@')) return <a key={i} href={`mailto:berlanda.medeiros@gmail.com`} className="text-2xl font-bold text-blue-600 hover:underline block my-4">berlanda.medeiros@gmail.com</a>;
                return <p key={i} className="text-blue-800 dark:text-blue-200 text-base">{l}</p>;
              })}
            </div>
          </div>
        );
      }

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
    <div className="container max-w-4xl mx-auto p-4 md:py-6 space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 md:p-6">
          {aboutContent ? formatContent(aboutContent) : <p className="text-center py-12 text-muted-foreground italic">Loading content...</p>}
        </CardContent>
      </Card>
    </div>
  );
}
