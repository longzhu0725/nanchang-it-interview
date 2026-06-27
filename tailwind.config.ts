import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "Roboto",
          "\"Helvetica Neue\"",
          "Arial",
          "\"PingFang SC\"",
          "\"Hiragino Sans GB\"",
          "\"Microsoft YaHei\"",
          "sans-serif",
        ],
      },
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.foreground"),
            "--tw-prose-headings": theme("colors.foreground"),
            "--tw-prose-lead": theme("colors.muted.foreground"),
            "--tw-prose-links": theme("colors.foreground"),
            "--tw-prose-bold": theme("colors.foreground"),
            "--tw-prose-counters": theme("colors.muted.foreground"),
            "--tw-prose-bullets": theme("colors.border"),
            "--tw-prose-hr": theme("colors.border"),
            "--tw-prose-quotes": theme("colors.foreground"),
            "--tw-prose-quote-borders": theme("colors.border"),
            "--tw-prose-captions": theme("colors.muted.foreground"),
            "--tw-prose-code": theme("colors.foreground"),
            "--tw-prose-pre-code": theme("colors.foreground"),
            "--tw-prose-pre-bg": theme("colors.muted"),
            "--tw-prose-th-borders": theme("colors.border"),
            "--tw-prose-td-borders": theme("colors.border"),
            maxWidth: "none",
            fontSize: "0.9375rem",
            lineHeight: "1.75",
            a: {
              textDecoration: "none",
              fontWeight: "500",
              borderBottom: "1px solid transparent",
              transition: "border-color 0.15s ease",
              "&:hover": {
                borderBottomColor: theme("colors.foreground"),
              },
            },
            h1: { fontWeight: "600", letterSpacing: "-0.02em" },
            h2: { fontWeight: "600", letterSpacing: "-0.01em", marginTop: "2em" },
            h3: { fontWeight: "600", marginTop: "1.5em" },
            h4: { fontWeight: "600" },
            code: {
              fontWeight: "500",
              backgroundColor: theme("colors.muted"),
              padding: "0.15em 0.4em",
              borderRadius: "0.25rem",
              fontSize: "0.875em",
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
            pre: {
              backgroundColor: theme("colors.muted"),
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: "0.875rem",
            },
            blockquote: {
              fontStyle: "normal",
              fontWeight: "400",
              borderLeftWidth: "2px",
            },
            hr: {
              borderTopWidth: "1px",
              marginTop: "2em",
              marginBottom: "2em",
            },
            ul: { marginTop: "1em", marginBottom: "1em" },
            ol: { marginTop: "1em", marginBottom: "1em" },
            li: { marginTop: "0.25em", marginBottom: "0.25em" },
            p: { marginTop: "0.75em", marginBottom: "0.75em" },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
export default config;
