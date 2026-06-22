export interface ArticleSeo {
	slug: string;
	title: string;
	description: string;
	image: string;
	lastmod: string;
}

export const articlesSeo: ArticleSeo[] = [
	{
		slug: 'emocinis-valgymas',
		title: 'Kodėl valgome tada, kai iš tikrųjų nesame alkani',
		description:
			'Emocinis valgymas dažnai prasideda ne nuo skrandžio, o nuo minčių ir jausmų. Pažvelkim, kaip atpažinti tikrąjį alkį ir švelniai grįžti prie savęs.',
		image: 'emocinis-valgymas.webp',
		lastmod: '2026-06-19',
	},
	{
		slug: 'schemos-kurios-kalba-prie-stalo',
		title: 'Schemos, kurios kalba už mus prie stalo',
		description:
			'Vaikystėje suformuoti scenarijai atveda mus prie šaldytuvo vidury nakties - net kai esame visiškai sotūs. Apie tai, kaip šiuos scenarijus atpažinti ir pradėti perrašyti.',
		image: 'schemos-kurios-kalba-prie-stalo.webp',
		lastmod: '2026-06-21',
	},
	{
		slug: 'visos-problemos-kyla-is-nesaugumo',
		title: 'Visos problemos kyla iš nesaugumo',
		description:
			'Prieš keletą dienų su drauge turėjome diskusiją, kurios esmė, kad visos problemos kyla iš nesaugumo. Saugumas nėra vien apie stogą virš galvos ar tam tikrą pinigų sumą banko sąskaitoje.',
		image: 'visos-problemos-kyla-is-nesaugumo.webp',
		lastmod: '2026-06-21',
	},
];

export const getArticleSeoBySlug = (slug: string): ArticleSeo | undefined => articlesSeo.find((article) => article.slug === slug);
