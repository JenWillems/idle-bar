export type PunishmentSeverity = "moderate" | "severe";

export interface Punishment {
  title: string;
  message: string;
  moneyPercent?: number;
  beerPercent?: number;
  moral: number;
}

export const punishmentTemplates: Record<PunishmentSeverity, Punishment[]> = {
  moderate: [
    {
      title: "Corporate Restructuring",
      message: "Je HR-afdeling heeft 'besloten' om je personeel te 'optimaliseren'. Ze zijn allemaal ontslagen. Efficiency!",
      moneyPercent: 0.25,
      beerPercent: 0.3,
      moral: -5
    },
    {
      title: "Klant Rechtszaak",
      message: "Een klant heeft je aangeklaagd voor 'vergiftiging' ofzo. Je advocaten kosten een fortuin. Maar hey, je hebt een mooie nieuwe rechtszaak!",
      moneyPercent: 0.35,
      moral: -6
    },
    {
      title: "Belastingdienst Audit",
      message: "De belastingdienst heeft 'toevallig' je bar uitgekozen voor een audit. Ze vinden 'onregelmatigheden'. Je betaalt boetes en 'administratiekosten'.",
      moneyPercent: 0.4,
      moral: -7
    },
    {
      title: "Bier Recall",
      message: "Je bier wordt teruggeroepen omdat het 'mogelijk gevaarlijk' is. Corporate zegt: 'Het is voor je eigen veiligheid!' Je verliest alles.",
      beerPercent: 0.5,
      moneyPercent: 0.2,
      moral: -8
    },
    {
      title: "Vijandige Overname",
      message: "Een concurrent heeft je bar 'overgenomen' via een vijandige overname. Je verliest controle en een groot deel van je winst. Maar je bent nu onderdeel van een 'groter geheel'!",
      moneyPercent: 0.45,
      beerPercent: 0.25,
      moral: -9
    }
  ],
  severe: [
    {
      title: "Massale Class Action Lawsuit",
      message: "Alle klanten die ooit je bar hebben bezocht, hebben een class action lawsuit tegen je aangespannen. Je verliest alles. Corporate zegt: 'Dit is normaal in de industrie!'",
      moneyPercent: 0.6,
      beerPercent: 0.7,
      moral: -15
    },
    {
      title: "Regulatory Shutdown",
      message: "De overheid heeft je bar gesloten voor 'veiligheidsredenen'. Je moet betalen voor 'hervormingen' en 'certificeringen'. Corporate cultuur in actie!",
      moneyPercent: 0.7,
      moral: -12
    },
    {
      title: "Bier Vergiftigd - Massale Recall",
      message: "Je bier heeft mensen ziek gemaakt. Of dood. Wie weet. Corporate zegt: 'We nemen dit serieus!' Je verliest alles en krijgt een levenslange boete.",
      beerPercent: 0.8,
      moneyPercent: 0.6,
      moral: -20
    },
    {
      title: "Corporate Merger - Je Bent Onbelangrijk",
      message: "Je bar is 'gefuseerd' met een groter bedrijf. Je bent nu een nummer. Je verliest je identiteit, je winst, en je ziel. Welkom bij corporate!",
      moneyPercent: 0.65,
      beerPercent: 0.5,
      moral: -18
    },
    {
      title: "Diefstal door 'Interne Herstructurering'",
      message: "Je geld is 'herverdeeld' door corporate. Ze noemen het 'optimalisatie'. Je noemt het diefstal. Ze winnen altijd.",
      moneyPercent: 0.55,
      moral: -14
    },
    {
      title: "Personeel Revolutie",
      message: "Je personeel heeft een revolutie georganiseerd. Ze hebben je bar overgenomen en je eruit gegooid. Ze zeggen: 'Dit is democratie!' Je verliest alles.",
      moneyPercent: 0.75,
      beerPercent: 0.6,
      moral: -16
    }
  ]
};

export function getRandomPunishment(severity: PunishmentSeverity): Punishment {
  const punishmentList = punishmentTemplates[severity];
  return punishmentList[Math.floor(Math.random() * punishmentList.length)];
}
