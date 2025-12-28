"use client";

import { Paragraph, Link } from "@digdir/designsystemet-react";
import { AiFillGithub } from "react-icons/ai";
import { FaLinkedinIn, FaStrava } from "react-icons/fa";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-6" style={{ backgroundColor: 'var(--ds-color-neutral-background-tinted)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
            © {year} Victor Uhnger
          </Paragraph>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            <Link
              href="https://github.com/vuhnger"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              style={{
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--ds-color-neutral-border-default)',
                borderRadius: '0.375rem',
                transition: 'all 0.2s'
              }}
            >
              <AiFillGithub style={{ fontSize: '1rem' }} />
            </Link>

            <Link
              href="https://www.linkedin.com/in/victoruhnger"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              style={{
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--ds-color-neutral-border-default)',
                borderRadius: '0.375rem',
                transition: 'all 0.2s'
              }}
            >
              <FaLinkedinIn style={{ fontSize: '0.875rem' }} />
            </Link>

            <Link
              href="https://www.strava.com/athletes/34349129"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Strava"
              style={{
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--ds-color-neutral-border-default)',
                borderRadius: '0.375rem',
                transition: 'all 0.2s'
              }}
            >
              <FaStrava style={{ fontSize: '0.875rem' }} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
