import Link from "next/link";
import type { ReactElement } from "react";

/** 紹介ページ・利用規約・プライバシーポリシーで同じ一番下の帯（home.css の .h-footer） */
export function SiteFooter(): ReactElement {
  return (
    <footer className="h-footer">
      <div className="h-inner h-footer-inner">
        <div className="h-footer-links">
          <Link href="/privacy">プライバシー</Link>
          <Link href="/terms">利用規約</Link>
          <a href="https://naoya-tsuji.com/?topic=giroku#contact" target="_blank" rel="noreferrer">お問い合わせ</a>
        </div>
        <p>© {new Date().getFullYear()} Naoya Tsuji</p>
        <p className="h-legal">
          iPhone、Mac、App Store は、米国およびその他の国で登録された Apple Inc. の商標です。Windows、Microsoft Store は Microsoft グループの商標です。
        </p>
      </div>
    </footer>
  );
}
