import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}', './lib/components/**/*.{html,js,svelte,ts}'],

	plugins: [],

	darkMode: 'selector',

	theme: {
		screens: {
			...defaultTheme.screens,
			xs: '480px'
		},
		extend: {
			colors: {
				// ShortBook brand color (standard is #924240)
				primary: {
					50: '#FEFBFB',
					100: '#FCF3F2',
					200: '#F8E3E3',
					300: '#EDC1C0',
					400: '#D78A89',
					500: '#C46B68',
					600: '#AE4F4C',
					700: '#924240',
					800: '#763534',
					900: '#592827',
					950: '#2F1514'
				}
			},
			aspectRatio: {
				logotype: '3170 / 512',
				'book-cover': '2 / 3'
			},
			animation: {
				'hide-delay': 'fadeout 0.5s 3s linear forwards'
			},
			keyframes: {
				fadeout: {
					'0%': { opacity: '1' },
					'99.9%, 100%': { opacity: '0' },
					'100%': { display: 'none' }
				}
			},
			fontFamily: {
				...defaultTheme.fontFamily,
				sans: [
					// -apple-system ... Mac・iOS
					// BlinkMacSystemFont ... Mac・iOS
					// "Helvetica Neue" ... Mac・iOS
					// "Hiragino Sans" ... Mac・iOS
					// Roboto ... Android
					// Arial ... Windows・Mac・iOS
					// "Apple Color Emoji" ... Mac・iOS
					'-apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans", Roboto, Arial, sans-serif, "Apple Color Emoji", "Noto Color Emoji"',
					{ fontFeatureSettings: '"palt"' }
				],
				serif: [
					'"Times New Roman", serif, "Noto Color Emoji"',
					{ fontFeatureSettings: '"palt"' }
				],
				title: [
					// "Cambria" ... Windows
					// "Hiragino Mincho ProN" ... Mac・iOS
					'"Cambria", "Hiragino Mincho ProN", serif, "Apple Color Emoji", "Noto Color Emoji"',
					{ fontFeatureSettings: '"palt"' }
				]
			}
		}
	}
};
