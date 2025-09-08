import { getHomePageSchema as fetchHomePageSchema } from '@/services/firebase/sites';
import type { PageSchema, ThemeTokens } from '@/types/siteTypes';

export async function getHomePageSchema(siteId: string) {
	try {
		const result = await fetchHomePageSchema(siteId);
		return result;
	} catch (error) {
		console.error('Error fetching home page schema:', error);
		return null;
	}
}

export function enhanceSiteWithPreview(site: any) {
	return {
		...site,
		homePage: null as { schema: PageSchema; theme: ThemeTokens } | null,
	};
}