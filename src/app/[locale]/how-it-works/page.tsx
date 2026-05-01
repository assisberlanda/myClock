"use client";

import { useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { loadLegalContent } from "@/shared/i18n/legalContent";

export default function HowItWorksPage() {
  const locale = useLocale();
  const [howItWorksContent, setHowItWorksContent] = useState("");

  useEffect(() => {
    const loadHowItWorksContent = async () => {
      const content = await loadLegalContent(locale, "funciona");
      setHowItWorksContent(content);
    };
    loadHowItWorksContent();
  }, [locale]);

  const formatContent = (content: string) => {
    if (!content) return null;
    
    const lines = content.split('\n');
    const sections: { title: string | null; type: string; lines: string[] }[] = [];
    let currentSection: { title: string | null; type: string; lines: string[] } = { title: null, type: 'intro', lines: [] };

    const isHeader = (line: string) => {
      const trimmed = line.trim();
      return trimmed.startsWith('# ') || trimmed.startsWith('## ') || /^\d+\./.test(trimmed) || 
             (trimmed.toLowerCase().includes('important') && trimmed.length < 20) ||
             (trimmed.toLowerCase().includes('importante') && trimmed.length < 20);
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      if (isHeader(line)) {
        sections.push(currentSection);
        
        const title = trimmed.replace(/^#+\s*/, '');
        const lowerTitle = title.toLowerCase();
        
        let type = 'default';
        if (trimmed.startsWith('# ')) type = 'main-title';
        else if (title.startsWith('1.')) type = 'shift';
        else if (title.startsWith('2.') || title.startsWith('4.')) type = 'rule-blue';
        else if (title.startsWith('6.')) type = 'rule-green';
        else if (title.startsWith('7.')) type = 'rule-yellow';
        else if (title.startsWith('8.') || title.startsWith('10.')) type = 'rule-red';
        else if (lowerTitle.includes('important') || lowerTitle.includes('importante') || lowerTitle.includes('svarbu') || lowerTitle.includes('важное')) type = 'important';
        
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
        
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return <li key={i} className="ml-6 list-disc mb-1 text-muted-foreground">{trimmed.substring(2)}</li>;
        }
        
        const cleanLine = trimmed.replace(/\*\*/g, '');
        const ruleKeywords = ['considera', 'considers', 'desconta', 'deducts', 'considère', 'consideră', 'учитывает'];
        const isRuleHighlight = sec.type.startsWith('rule-') && (i === 0 || ruleKeywords.some(k => trimmed.toLowerCase().includes(k)));
        const isBoldHighlight = trimmed.startsWith('**') && trimmed.endsWith('**');

        if ((isRuleHighlight || isBoldHighlight) && sec.type !== 'main-title') {
          let bgColor = "bg-gray-100 dark:bg-gray-800";
          let textColor = "text-foreground";
          let borderColor = "border-gray-200 dark:border-gray-700";
          
          if (sec.type === 'rule-blue') { bgColor = "bg-blue-50 dark:bg-blue-900/20"; borderColor = "border-blue-200 dark:border-blue-800"; textColor = "text-blue-800 dark:text-blue-200"; }
          if (sec.type === 'rule-green') { bgColor = "bg-green-50 dark:bg-green-900/20"; borderColor = "border-green-200 dark:border-green-800"; textColor = "text-green-800 dark:text-green-200"; }
          if (sec.type === 'rule-yellow') { bgColor = "bg-yellow-50 dark:bg-yellow-900/20"; borderColor = "border-yellow-200 dark:border-yellow-800"; textColor = "text-yellow-800 dark:text-yellow-200"; }
          if (sec.type === 'rule-red') { bgColor = "bg-red-50 dark:bg-red-900/20"; borderColor = "border-red-200 dark:border-red-800"; textColor = "text-red-800 dark:text-red-200"; }

          return (
            <div key={i} className={`${bgColor} ${borderColor} border rounded-lg p-5 my-4 shadow-sm`}>
              <p className={`${textColor} font-bold text-base leading-relaxed`}>{cleanLine}</p>
            </div>
          );
        }

        return <p key={i} className="text-base leading-relaxed mb-3 text-muted-foreground">{cleanLine}</p>;
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
          {howItWorksContent ? formatContent(howItWorksContent) : <p className="text-center py-12 text-muted-foreground italic">Loading content...</p>}
        </CardContent>
      </Card>
    </div>
  );
}
