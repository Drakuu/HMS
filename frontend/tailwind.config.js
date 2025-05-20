// tailwind.config.js
module.exports = {
    theme: {
      extend: {
        colors: {
          primary: {
            50: 'oklch(98.4% 0.019 200.873)', /* Very light cyan */
            100: 'oklch(95.6% 0.045 203.388)', /* Lighter cyan */
            200: 'oklch(91.7% 0.08 205.041)', /* Light cyan */
            300: 'oklch(78.9% 0.154 211.53)', /* Soft cyan */
            400: 'oklch(78.9% 0.154 211.53)', /* Medium cyan */
            500: 'oklch(71.5% 0.143 215.221)', /* Base cyan */
            600: 'oklch(60.9% 0.126 221.723)', /* Darker cyan */
            700: 'oklch(52% 0.105 223.128)', /* Deep cyan */
            800: 'oklch(45% 0.085 224.283)', /* Dark cyan */
            900: 'oklch(39.8% 0.07 227.392)', /* Very dark cyan */
            950: 'oklch(30.2% 0.056 229.695)', /* Near-black cyan */
          },
          // To use a different color scheme, like teal
          teal: {
            50: 'oklch(98.4% 0.02 170)',  /* Very light teal */
            100: 'oklch(94.5% 0.04 170)', /* Lighter teal */
            200: 'oklch(88% 0.08 170)',   /* Light teal */
            300: 'oklch(80% 0.12 170)',   /* Soft teal */
            400: 'oklch(72% 0.14 170)',   /* Medium teal */
            500: 'oklch(65% 0.16 170)',   /* Base teal */
            600: 'oklch(58% 0.18 170)',   /* Darker teal */
            700: 'oklch(50% 0.20 170)',   /* Deep teal */
            800: 'oklch(42% 0.22 170)',   /* Dark teal */
            900: 'oklch(35% 0.24 170)',   /* Very dark teal */
            950: 'oklch(27% 0.26 170)',   /* Near-black teal */
          },
        },
      },
    },
    
  }
  