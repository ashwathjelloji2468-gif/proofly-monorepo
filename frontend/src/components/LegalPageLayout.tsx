'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useStore, StaticPage } from '@/store/useStore';
import { ChevronLeft, Scale, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface LegalPageLayoutProps {
  slug: string;
}

export function LegalPageLayout({ slug }: LegalPageLayoutProps) {
  const fetchStaticPage = useStore(state => state.fetchStaticPage);
  const [page, setPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const data = await fetchStaticPage(slug);
        setPage(data);
      } catch (err) {
        console.error('Error fetching static page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [slug, fetchStaticPage]);

  // Icon selector based on slug
  const getIcon = () => {
    switch (slug) {
      case 'terms':
        return <FileText className="w-8 h-8 text-brand-teal" />;
      case 'privacy':
        return <ShieldAlert className="w-8 h-8 text-brand-emerald" />;
      case 'gdpr':
        return <CheckCircle2 className="w-8 h-8 text-indigo-400" />;
      default:
        return <Scale className="w-8 h-8 text-brand-teal" />;
    }
  };

  // Safe and simple custom Markdown parser
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // H1 Header
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-3xl font-extrabold text-white mt-8 mb-6 border-b border-white/10 pb-3 flex items-center gap-3">
            {getIcon()}
            <span>{line.replace('# ', '')}</span>
          </h1>
        );
      }
      // H2 Header
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-white mt-8 mb-4 border-l-2 border-brand-teal pl-3">
            {line.replace('## ', '')}
          </h2>
        );
      }
      // H3 Header
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-white mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      }
      // List items (* or -)
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const cleanLine = line.replace(/^[\*\-]\s+/, '');
        return (
          <li key={idx} className="text-sm text-muted-foreground ml-6 list-disc mb-2 leading-relaxed">
            {parseInlineMarkdown(cleanLine)}
          </li>
        );
      }
      // Empty spaces
      if (line.trim() === '') {
        return <div key={idx} className="h-3" />;
      }
      // Paragraph
      return (
        <p key={idx} className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {parseInlineMarkdown(line.trim())}
        </p>
      );
    });
  };

  // Parse simple inline elements like bold (`**text**`), code (`\`code\``) and links (`[text](url)`)
  const parseInlineMarkdown = (text: string) => {
    // Regex for link matches [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(parseBoldAndCode(text.substring(lastIndex, match.index)));
      }
      parts.push(
        <Link key={match.index} href={match[2]} className="text-brand-teal hover:text-brand-teal/80 hover:underline font-semibold transition">
          {match[1]}
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(parseBoldAndCode(text.substring(lastIndex)));
    }
    return parts.length > 0 ? parts : parseBoldAndCode(text);
  };

  // Helper to parse bold (**bold**) and inline code (`code`)
  const parseBoldAndCode = (text: string): React.ReactNode => {
    // A very basic parser for **bold** and `code`
    let parts: React.ReactNode[] = [text];
    
    // Parse bold
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let boldMatch;
    let boldParts: React.ReactNode[] = [];
    let lastIdx = 0;
    while ((boldMatch = boldRegex.exec(text)) !== null) {
      if (boldMatch.index > lastIdx) {
        boldParts.push(text.substring(lastIdx, boldMatch.index));
      }
      boldParts.push(<strong key={boldMatch.index} className="font-extrabold text-white">{boldMatch[1]}</strong>);
      lastIdx = boldRegex.lastIndex;
    }
    if (lastIdx < text.length) {
      boldParts.push(text.substring(lastIdx));
    }
    
    if (boldParts.length > 0) {
      parts = boldParts;
    }

    // Parse inline code if any
    const codeRegex = /`([^`]+)`/g;
    let codeMatch;
    let finalParts: React.ReactNode[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof part !== 'string') {
        finalParts.push(part);
        continue;
      }
      
      let lastCIdx = 0;
      let tempParts: React.ReactNode[] = [];
      while ((codeMatch = codeRegex.exec(part)) !== null) {
        if (codeMatch.index > lastCIdx) {
          tempParts.push(part.substring(lastCIdx, codeMatch.index));
        }
        tempParts.push(
          <code key={codeMatch.index} className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-brand-teal">
            {codeMatch[1]}
          </code>
        );
        lastCIdx = codeRegex.lastIndex;
      }
      if (lastCIdx < part.length) {
        tempParts.push(part.substring(lastCIdx));
      }
      
      if (tempParts.length > 0) {
        finalParts.push(...tempParts);
      } else {
        finalParts.push(part);
      }
    }

    return <React.Fragment>{finalParts}</React.Fragment>;
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20">
        {/* Navigation Breadcrumb */}
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-xs font-semibold text-muted-foreground hover:text-white transition mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to homepage</span>
        </Link>

        {/* Dynamic content card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-teal/10 rounded-full blur-3xl pointer-events-none" />

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-white/10 rounded w-1/3 mb-10" />
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
              <div className="h-4 bg-white/10 rounded w-4/5" />
              <div className="h-4 bg-white/10 rounded w-full mt-8" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          ) : page ? (
            <article className="prose prose-invert max-w-none">
              {renderMarkdown(page.content)}
              {page.updatedAt && (
                <p className="text-[10px] text-muted-foreground/60 mt-12 border-t border-white/5 pt-4 text-right">
                  Last updated in the Proofly database: {new Date(page.updatedAt).toLocaleDateString()}
                </p>
              )}
            </article>
          ) : (
            <div className="text-center py-16 space-y-4">
              <Scale className="w-12 h-12 text-muted-foreground mx-auto animate-bounce" />
              <h2 className="text-xl font-bold text-white">Document Not Found</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                The requested legal document (`{slug}`) was not found or is currently being updated by the Proofly compliance team.
              </p>
              <Link href="/">
                <button className="mt-6 bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2 px-4 rounded-lg shadow-md transition cursor-pointer">
                  Return to Home
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
