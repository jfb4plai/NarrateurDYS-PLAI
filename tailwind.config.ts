import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'jfb-noir':    '#1a1a1a',
        'jfb-rose':    '#FF3399',
        'jfb-beige':   '#F5F0E8',
        'jfb-gris':    '#5a5a5a',
        'jfb-gris-cl': '#909090',
        'jfb-bordure': '#e8e8e8',
        'jfb-subtil':  '#f9f9f7',
        'teal':        '#0a9370',
      },
    },
  },
  plugins: [],
}
export default config
