/** @type {import('tailwindcss').Config}*/

const config = {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./lib/components/**/*.{html,js,svelte,ts}',
	],

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
					800: '#592827',
					900: '#2F1514'
				}
			},
      aspectRatio: {
        'logotype': '3170 / 512',
      }
		}
	}
};

module.exports = config;
