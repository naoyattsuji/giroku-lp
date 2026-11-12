import type { Metadata } from "next";
import type { ReactElement } from "react";
import { LegalPage, type LegalSection } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 — Giroku",
  description: "Giroku の有料プラン Pro の販売者・価格・支払い・解約・返金について記載しています。",
  alternates: { canonical: "/legal" },
};

/* 2026-11-12 作成（本人の判断）。個人の運営なので、所在地と電話番号は「請求があれば遅滞なく開示」の書き方にする。
 * 中身は利用規約（/terms 第5条）・紹介ページと食い違わないようにする。値段や上限を変えたら、ここも直す。 */
const sections: LegalSection[] = [
  {
    id: "l1",
    label: "1",
    title: "販売事業者・運営責任者",
    blocks: [{ p: "辻直哉（個人）" }],
  },
  {
    id: "l2",
    label: "2",
    title: "所在地・電話番号",
    blocks: [
      {
        p: "請求があった場合は、遅滞なく開示します。開示のご請求とお問い合わせは、下のメールアドレスにご連絡ください。",
      },
    ],
  },
  {
    id: "l3",
    label: "3",
    title: "メールアドレス",
    blocks: [
      {
        p: (
          <>
            <a href="mailto:naoyattsuji@gmail.com">naoyattsuji@gmail.com</a>
          </>
        ),
      },
    ],
  },
  {
    id: "l4",
    label: "4",
    title: "販売するもの",
    blocks: [
      {
        p: "Giroku の有料プラン「Pro」（年額または月額の自動更新）。高品質な AI での議事録の作成と質問、文章の仕上げを使えます。iPhone 版では広告が表示されなくなります。iPhone 版とパソコン版（Mac・Windows）は別々に購入します。",
      },
    ],
  },
  {
    id: "l5",
    label: "5",
    title: "販売価格",
    blocks: [
      {
        list: [
          "年額：980円",
          "月額：200円",
          "iPhone 版は、App Store の購入画面に表示される金額（税込）です。パソコン版は、Lemon Squeezy の購入画面に、税を含めたお支払いの総額を表示します。",
        ],
      },
    ],
  },
  {
    id: "l6",
    label: "6",
    title: "販売価格以外にかかる費用",
    blocks: [{ p: "アプリのダウンロードや AI 機能の利用にかかるインターネットの通信料は、お客様の負担です。" }],
  },
  {
    id: "l7",
    label: "7",
    title: "支払い方法と販売の窓口",
    blocks: [
      {
        list: [
          "iPhone 版：App Store のアプリ内課金。Apple が販売し、Apple ID に登録した支払い方法で請求されます。",
          "パソコン版：Lemon Squeezy の購入画面。Lemon Squeezy（Lemon Squeezy, LLC）が販売の窓口として、決済と請求書の発行を行います。使える支払い方法は購入画面に表示します。",
        ],
      },
    ],
  },
  {
    id: "l8",
    label: "8",
    title: "支払いの時期",
    blocks: [
      {
        p: "購入したときに、最初の期間（1年または1か月）の料金を支払います。その後は、解約しない限り、期間が終わるたびに同じ料金で自動で更新され、更新日に請求されます。",
      },
    ],
  },
  {
    id: "l9",
    label: "9",
    title: "提供の時期",
    blocks: [
      {
        list: [
          "iPhone 版：購入が終わるとすぐに Pro になります。",
          "パソコン版：購入が終わるとすぐに、購入キーをメールでお送りします。アプリの設定に入れると Pro になります。",
        ],
      },
    ],
  },
  {
    id: "l10",
    label: "10",
    title: "解約",
    blocks: [
      {
        list: [
          "iPhone 版：iPhone の［設定］→ 自分の名前 →［サブスクリプション］から、いつでも解約できます。更新日の24時間前までに解約しない限り、自動で更新されます。",
          "パソコン版：購入したときのメールにある管理画面から、いつでも解約できます。更新日までに解約しない限り、自動で更新されます。",
          "どちらも、解約したあとも期間の終わりまでは Pro を使えます。",
        ],
      },
    ],
  },
  {
    id: "l11",
    label: "11",
    title: "返品・返金",
    blocks: [
      {
        p: "デジタルのサービスのため、購入のあとの返品はお受けできません。返金は、パソコン版は Lemon Squeezy の決まりに、iPhone 版は Apple の決まりに従います。アプリが正しく動かない場合は、メールでお問い合わせください。",
      },
    ],
  },
  {
    id: "l12",
    label: "12",
    title: "動作環境",
    blocks: [
      {
        list: ["iPhone：iOS 16.4 以降", "Mac：macOS 13 以降・Apple シリコン", "Windows：Windows 10・11（64ビット）"],
      },
    ],
  },
];

export default function LegalNoticePage(): ReactElement {
  return <LegalPage title="特定商取引法に基づく表記" updated="2026年11月12日" sections={sections} />;
}
