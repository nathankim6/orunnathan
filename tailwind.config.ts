
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			nanum: [
  				'Nanum Gothic',
  				'sans-serif'
  			],
  			inter: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			montserrat: [
  				'Montserrat',
  				'sans-serif'
  			],
  			mono: [
  				'Space Mono',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			],
  			orbitron: [
  				'Orbitron',
  				'sans-serif'
  			],
  			system: [
  				'Noto Sans KR',
  				'Inter',
  				'Segoe UI',
  				'SF Pro Display',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'sans-serif'
  			],
  			noto: [
  				'Noto Sans KR',
  				'sans-serif'
  			],
  			gulim: [
  				'Gulim',
  				'굴림',
  				'sans-serif'
  			],
  			poppins: [
  				'Poppins',
  				'Noto Sans KR',
  				'sans-serif'
  			],
  			sans: [
  				'Figtree',
  				'Outfit',
  				'Noto Sans KR',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'sans-serif'
  			],
  			display: [
  				'Outfit',
  				'Noto Sans KR',
  				'sans-serif'
  			],

  			serif: [
  				'Lora',
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			]
  		},
		colors: {
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			primary: {
				DEFAULT: 'hsl(var(--primary))',
				foreground: 'hsl(var(--primary-foreground))',
				glow: 'hsl(var(--primary-glow))',
				dark: 'hsl(var(--primary-dark))'
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))'
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))',
				glow: 'hsl(var(--accent-glow))'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))'
			},
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))'
			},
			neon: {
				cyan: 'hsl(var(--neon-cyan))',
				purple: 'hsl(var(--neon-purple))',
				pink: 'hsl(var(--neon-pink))',
				blue: 'hsl(var(--neon-blue))'
			}
		},
		keyframes: {
			'accordion-down': {
				from: {
					height: '0'
				},
				to: {
					height: 'var(--radix-accordion-content-height)'
				}
			},
			'accordion-up': {
				from: {
					height: 'var(--radix-accordion-content-height)'
				},
				to: {
					height: '0'
				}
			},
			shimmer: {
				'0%': {
					transform: 'translateX(-100%)'
				},
				to: {
					transform: 'translateX(100%)'
				}
			},
			gradient: {
				'0%, 100%': {
					opacity: '0.7'
				},
				'50%': {
					opacity: '0.9'
				}
			},
			'progress-wave': {
				'0%': {
					transform: 'translateX(-100%) scaleY(1)'
				},
				'50%': {
					transform: 'translateX(0%) scaleY(1.2)'
				},
				'100%': {
					transform: 'translateX(100%) scaleY(1)'
				}
			},
			'float-gentle': {
				'0%, 100%': {
					transform: 'translateY(0px) rotate(0deg)'
				},
				'50%': {
					transform: 'translateY(-10px) rotate(5deg)'
				}
			},
			'pulse-glow': {
				'0%, 100%': {
					boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
				},
				'50%': {
					boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
				}
			},
			'pulse-neon': {
				'0%, 100%': {
					boxShadow: '0 0 20px hsl(var(--neon-cyan) / 0.4), 0 0 40px hsl(var(--neon-cyan) / 0.2)'
				},
				'50%': {
					boxShadow: '0 0 30px hsl(var(--neon-cyan) / 0.6), 0 0 60px hsl(var(--neon-cyan) / 0.3)'
				}
			},
			'fade-in': {
				'0%': {
					opacity: '0',
					transform: 'translateY(10px)'
				},
				'100%': {
					opacity: '1',
					transform: 'translateY(0)'
				}
			},
			'scale-in': {
				'0%': {
					transform: 'scale(0.95)',
					opacity: '0'
				},
				'100%': {
					transform: 'scale(1)',
					opacity: '1'
				}
			},
			'glow-pulse': {
				'0%, 100%': {
					opacity: '0.5'
				},
				'50%': {
					opacity: '1'
				}
			},
			'border-flow': {
				'0%, 100%': {
					backgroundPosition: '0% 50%'
				},
				'50%': {
					backgroundPosition: '100% 50%'
				}
			}
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'spin-slow': 'spin 3s linear infinite',
			shimmer: 'shimmer 0.5s infinite',
			gradient: 'gradient 3s ease-in-out infinite',
			'progress-wave': 'progress-wave 2s ease-in-out infinite',
			'float-gentle': 'float-gentle 3s ease-in-out infinite',
			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
			'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
			'fade-in': 'fade-in 0.3s ease-out',
			'scale-in': 'scale-in 0.2s ease-out',
			'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
			'border-flow': 'border-flow 3s ease infinite'
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
