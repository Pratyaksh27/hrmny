/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
			bgCanvas: '#ffffff',            // was: background
			sidebar: '#161f2a',             // bg.left-sidebar
			transcript: '#d9d9d9',          // bg.transcript-container
			textPrimary: '#000000',         // was: textDefault
			textMuted: '#b9b4cd',           // neutral.100
			hamburger: '#b9b4cd',
			brand: '#b9b4cd',
			buttonText: '#000000',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
		spacing: {
			1: '4px',
			2: '8px',
			3: '12px',
			4: '16px',
			5: '24px',
			6: '32px',
			7: '48px',
		},

		borderRadius: {
			sm: '6px',               // from Figma
			md: '10px',
			lg: '24px',
			DEFAULT: 'var(--radius)',             // ShadCN base
			mdCalc: 'calc(var(--radius) - 2px)',  // override md for ShadCN
			smCalc: 'calc(var(--radius) - 4px)',  // override sm for ShadCN
		},

		fontSize: {
			xs: '12px',
			sm: '14px',
			base: '16px',
			lg: '24px',
		},

		fontWeight: {
			regular: '400',
			semibold: '600',
			bold: '700',
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
