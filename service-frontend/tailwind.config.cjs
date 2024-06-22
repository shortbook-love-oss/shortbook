/** @type {import('tailwindcss').Config}*/

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}', './lib/components/**/*.{html,js,svelte,ts}'],

	plugins: [],

	darkMode: 'selector',

	theme: {
		extend: {
			colors: {
				// ShortBook brand color (standard is #924240)
				primary: {
					50: '#FCF9F9',
					100: '#F4E7E7',
					200: '#E8CBCA',
					300: '#DCAFAE',
					400: '#C98584',
					500: '#BC6967',
					600: '#AE4F4C',
					700: '#924240',
					800: '#763534',
					900: '#592827',
					950: '#2F1514'
				}
			},
			aspectRatio: {
				logotype: '3170 / 512'
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
			}
		}
	}
};

module.exports = config;
