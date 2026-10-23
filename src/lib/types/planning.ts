/** Un rendez-vous. Les instants sont en millisecondes UTC ; pour une journée entière, minuit UTC du jour (fin incluse). */
export interface Evenement {
	titre: string;
	debut: number;
	fin: number;
	journeeEntiere: boolean;
	description: string;
	lieu: string;
	organisateur: string;
}

export interface FichierPlanning {
	id: string;
	nom: string;
	evenements: Evenement[];
	/** Lignes du fichier qu'on n'a pas pu lire (date absente ou illisible). */
	ignorees: number;
	/** Renseigné si le fichier entier est inutilisable. */
	erreur?: string;
}

export interface LectureCsv {
	evenements: Evenement[];
	ignorees: number;
}
