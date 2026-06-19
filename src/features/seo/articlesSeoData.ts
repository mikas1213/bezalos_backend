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
		image: 'article-eating.webp',
		lastmod: '2026-06-19',
	},
	{
		slug: 'pusryciai-baltymai',
		title: 'Sotūs pusryčiai: kiek baltymų iš tiesų reikia ryte',
		description:
			'Subalansuoti pusryčiai padeda išvengti popietinio alkio bangų. Štai paprasta formulė, kuri tinka beveik kiekvienai dienai.',
		image: 'article-produce.webp',
		lastmod: '2026-06-19',
	},
	{
		slug: 'santykis-su-maistu',
		title: 'Maistas nėra nei „geras", nei „blogas"',
		description:
			'Kai maistą skirstome į leistiną ir draudžiamą, kuriame įtampą. Kalbamės apie tai, kaip atsisakyti kaltės ir valgyti ramiau.',
		image: 'article-hands.webp',
		lastmod: '2026-06-19',
	},
	{
		slug: 'iprociai-maziems-zingsniams',
		title: 'Maži žingsniai, kurie iš tikrųjų išlieka',
		description:
			'Ilgalaikiai pokyčiai gimsta ne iš griežtų taisyklių, o iš mažų, pasikartojančių sprendimų. Kaip kurti įpročius be prievartos sau.',
		image: 'article-believe.webp',
		lastmod: '2026-06-19',
	},
	{
		slug: 'klientes-istorija',
		title: '„Pirmą kartą nustojau skaičiuoti kalorijas ir atsikvėpiau"',
		description:
			'Vienos bendruomenės narės kelionė nuo nuolatinio savęs ribojimo prie ramaus, sąmoningo santykio su maistu ir savimi.',
		image: 'article-kitchen.webp',
		lastmod: '2026-06-19',
	},
	{
		slug: 'uzkandziai-be-kaltes',
		title: 'Užkandžiai be kaltės: ką turėti po ranka',
		description:
			'Sotus ir paprastas užkandis gali sustabdyti vakarinį apsivalgymą. Keletas idėjų, kurias paruoši per kelias minutes.',
		image: 'article-plate.webp',
		lastmod: '2026-06-19',
	},
	{
		slug: 'apetito-bangos',
		title: 'Apetito bangos vakare: iš kur jos kyla',
		description:
			'Vakarinis alkis dažnai turi mažiau bendro su maistu, nei atrodo. Kalbamės apie nuovargį, įtampą ir kaip į juos atsiliepti.',
		image: 'article-stress.webp',
		lastmod: '2026-06-19',
	},
];

export const getArticleSeoBySlug = (slug: string): ArticleSeo | undefined => articlesSeo.find((article) => article.slug === slug);
