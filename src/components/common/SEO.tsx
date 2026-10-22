import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const BASE_URL = 'https://nextpda.app';
const DEFAULT_IMAGE = `${BASE_URL}/icons/app-icon.svg`;

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = 'NextPDA, 4PDA, форум 4pda, прошивки, android, recovery, twrp, magisk, root, xiaomi, hyperos, новости технологий',
  canonicalPath,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  publishedTime,
  author = 'NextPDA Community',
  jsonLd,
}) => {
  const location = useLocation();
  const currentUrl = `${BASE_URL}${canonicalPath || location.pathname}`;
  const fullTitle = `${title} — NextPDA`;

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to update link tag
    const setLinkTag = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // 2. Standard Meta
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('meta[name="author"]', 'name', 'author', author);

    // 3. Canonical
    setLinkTag('canonical', currentUrl);

    // 4. OpenGraph
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'NextPDA');
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    if (publishedTime) {
      setMetaTag('meta[property="article:published_time"]', 'property', 'article:published_time', publishedTime);
    }

    // 5. Twitter Card
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    // 6. JSON-LD Structured Data for Google Indexing
    const defaultWebSiteLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'NextPDA',
      'url': BASE_URL,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${BASE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    const ldData = jsonLd ? (Array.isArray(jsonLd) ? [defaultWebSiteLd, ...jsonLd] : [defaultWebSiteLd, jsonLd]) : defaultWebSiteLd;

    let scriptTag = document.getElementById('json-ld-seo') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-seo';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(ldData);
  }, [fullTitle, description, keywords, currentUrl, ogImage, ogType, publishedTime, author, jsonLd]);

  return null;
};
