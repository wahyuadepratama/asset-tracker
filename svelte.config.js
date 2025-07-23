import adapterAuto from '@sveltejs/adapter-auto';
import adapterNode from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter:
			process.env.NODE_ENV === 'production'
				? adapterNode({ out: 'build' })
				: adapterAuto()
	}
};

export default config;
