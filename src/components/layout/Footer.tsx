"use client";

import { APP_FULL_NAME } from "@/config/version";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 mt-auto border-t border-border-subtle bg-white dark:bg-black/20">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Version */}
          <div className="flex items-center gap-4">
            <img 
              src="/MyClock.png" 
              alt="My Clock" 
              className="h-8 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground/80 leading-none">
                {APP_FULL_NAME}
              </span>
              <span className="text-[10px] text-muted-foreground/60 mt-1">
                v1.0.0
              </span>
            </div>
          </div>

          {/* Copyright - Centered on desktop */}
          <div className="text-[11px] text-muted-foreground/50 text-center md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            &copy; 2026 Assis Berlanda de Medeiros. <br className="md:hidden" /> Todos os direitos reservados.
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/terms-of-use"
              className="text-[11px] font-medium text-muted-foreground/80 hover:text-blue-600 transition-colors underline decoration-muted-foreground/30 underline-offset-4"
            >
              Termos de Uso
            </Link>

            <Link
              href="/privacy-policy"
              className="text-[11px] font-medium text-muted-foreground/80 hover:text-blue-600 transition-colors underline decoration-muted-foreground/30 underline-offset-4"
            >
              Privacidade
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
