// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Momentum Design Tokens",
  tagline: "Momentum Design System",
  url: "https://momentum-design.github.io",
  baseUrl: "/tokens/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "momentum-design",
  projectName: "tokens",
  deploymentBranch: "docs",
  trailingSlash: false,
  plugins: ["docusaurus-plugin-sass"],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl: "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Momentum Design Tokens",
        logo: {
          alt: "Momentum Design Logo",
          srcDark: "img/logo.svg",
          src: "img/logo_light.svg",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Docs",
          },
          {
            href: "https://github.com/momentum-design/tokens",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Resources",
            items: [
              {
                label: "Momentum Changelog",
                href: "https://www.figma.com/file/aSsgM88pH7h2it9a9H4aVL/Momentum-Release-Radar?node-id=638%3A1912",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Tokens GitHub",
                href: "https://github.com/momentum-design/tokens",
              },
            ],
          },
          {
            title: "Design Systems",
            items: [
              {
                label: "Momentum For Collaboration - Web",
                href: "https://github.com/momentum-design/momentum-react-v2",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Momentum Design. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
