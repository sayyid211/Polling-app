import tailwindcss from '@tailwindcss/postcss';

const isTest = process.env.VITEST || process.env.NODE_ENV === 'test';

const config = {
	plugins: isTest ? [] : [tailwindcss()]
};

export default config;
