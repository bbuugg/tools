/** @type {import('tailwindcss').Config} */
import withMT from '@material-tailwind/html/utils/withMT'

const config = withMT({
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
})

export default config
