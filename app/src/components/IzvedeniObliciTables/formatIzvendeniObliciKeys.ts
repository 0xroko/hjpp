export const formatIzvedniObliciKeys = (izvedeniOblikKey?: string) => {
  const izvedniObliciMap = {
    mnozina: "množina",
    jednina: "jednina",
    zenskiRod: "ženski rod",
    muskiRod: "muški rod",
    srednjiRod: "srednji rod",
    glagolskiPridjevAktivni: "Glagolski pridjev aktivni",
    glagolskiPridjevPasivni: "Glagolski pridjev pasivni",
    glagolskiPrilogSadasnji: "Glagolski prilog sadašnji",
    glagolskiPrilogProsli: "Glagolski prilog prošli",
    prvoLice: "1. lice",
    drugoLice: "2. lice",
    treceLice: "3. lice",
    futur: "Futur",
    imperativ: "Imperativ",
    prezent: "Prezent",
    imperfekt: "Imperfekt",
    perfekt: "Perfekt",
    pluskvamperfekt: "Pluskvamperfekt",
    infinitiv: "Infinitiv",
    aorist: "Aorist",
    pozitivNeodredeni: "Pozitiv neodređeni",
    pozitivOdredeni: "Pozitiv određeni",
    pozitiv: "Pozitiv",
    superlativ: "Superlativ",
    komparativ: "Komparativ",
  };

  const izvedeni =
    izvedniObliciMap[izvedeniOblikKey as keyof typeof izvedniObliciMap];

  return izvedeni ?? izvedeniOblikKey;
};
