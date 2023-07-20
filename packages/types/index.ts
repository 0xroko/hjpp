export interface DefinitionMetadata {
  // data from sitemap
  hjp: {
    url: string;
    // id extracted from url
    id: string;
    // keyword extracted from url
    keyWord: string;
  };
}

export type VrstaRijeciBazna =
  | "imenica"
  | "prijedlog"
  | "pridjev"
  | "prilog"
  | "glagol"
  | "broj"
  | "zamjenica"
  | "veznik"
  | "usklik"
  | "cestica";

export type VrstaRijeci = VrstaRijeciBazna | "nepoznato";

export type DefnicijaBase = {
  id: string;
  rijec: string;
  detalji: string | null;
  definicija: string | { [key: string]: string };
  frazeologija: { fraza: string; znacenje: string | null }[] | null;
  sintagma: { sintagma: string; znacenje: string | null }[] | null;
  etimologija: string | null;
  onomastika: string | null;
} & DefinitionMetadata;

export type Padezi = {
  nominativ?: string;
  genitiv?: string;
  dativ?: string;
  akuzativ?: string;
  vokativ?: string;
  lokativ?: string;
  instrumental?: string;
};

export type PadeziPoBroju = {
  jednina?: Padezi;
  mnozina?: Padezi;
};

export type DefinicijaImenica = DefnicijaBase & {
  vrsta: "imenica";
  izvedeniOblici: PadeziPoBroju;
};

export type PridjevIzvedeniObliciBase = {
  muskiRod?: PadeziPoBroju;
  zenskiRod?: PadeziPoBroju;
  srednjiRod?: PadeziPoBroju;
};

export type PridjevIzvedeniOblici =
  | {
      komparativ: PridjevIzvedeniObliciBase;
      superlativ: PridjevIzvedeniObliciBase;
    } & (
      | {
          pozitivNeodredeni: PridjevIzvedeniObliciBase;
          pozitivOdr: PridjevIzvedeniObliciBase;
        }
      | { pozitiv: PridjevIzvedeniObliciBase }
    );

export type DefinicijaPridjev = DefnicijaBase & {
  vrsta: "pridjev";
  izvedeniOblici: PridjevIzvedeniOblici;
};

export type GlagolPoLicima = {
  prvoLice?: string;
  drugoLice?: string;
  treceLice?: string;
};

export type GlagolIzvedeniOblik = {
  jednina?: GlagolPoLicima;
  mnozina?: GlagolPoLicima;
};

export type GlagolIzvedeniOblikPosebni = string | string[];

export type GlagolIzvedeniOblici = {
  infinitiv?: string;
  prezent?: GlagolIzvedeniOblik;
  futur?: GlagolIzvedeniOblik;
  aorist?: GlagolIzvedeniOblik;
  perfekt?: GlagolIzvedeniOblik;
  pluskvamperfekt?: GlagolIzvedeniOblik;
  imperativ?: GlagolIzvedeniOblik;

  glagolskiPrilogProsli?: GlagolIzvedeniOblikPosebni;
  glagolskiPrilogSadasnji?: GlagolIzvedeniOblikPosebni;

  glagolskiPridjevAktivni?: GlagolIzvedeniOblikPosebni;
  glagolskiPridjevPasivni?: GlagolIzvedeniOblikPosebni;
};

export type GlagolIzvedeniObliciKeys = keyof GlagolIzvedeniOblici;

export type GlagolskiVid = "svršeni" | "nesvršeni" | "dvovidni";

export type DefinicijaGlagol = DefnicijaBase & {
  vrsta: "glagol";
  izvedeniOblici: GlagolIzvedeniOblici;
  glagolskiVid: GlagolskiVid;
};

type OtherVrsta = Exclude<VrstaRijeciBazna, "imenica" | "pridjev" | "glagol">;

export type DefinicijaOther = DefnicijaBase & {
  vrsta: OtherVrsta;
  izvedeniOblici: null;
};

export type Definicija =
  | DefinicijaImenica
  | DefinicijaPridjev
  | DefinicijaGlagol
  | DefinicijaOther;

export type DefinicijaNoId = Omit<Definicija, "id">;
