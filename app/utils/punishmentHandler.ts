import type { PunishmentSeverity } from "./punishments";
import { getRandomPunishment } from "./punishments";
import { getRandomDialog } from "../constants/dialogs";

export interface PunishmentHandlers {
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  setBeer: React.Dispatch<React.SetStateAction<number>>;
  adjustMoral: (delta: number) => void;
  showSkeletonComment: (dialog: string) => void;
  pushLog: (message: string) => void;
  moral: number;
}

export function triggerPunishment(
  severity: PunishmentSeverity,
  handlers: PunishmentHandlers
) {
  const punishment = getRandomPunishment(severity);
  
  let moneyLost = 0;
  let beerLost = 0;
  
  if (punishment.moneyPercent) {
    handlers.setMoney((m: number) => {
      moneyLost = Math.floor(m * punishment.moneyPercent!);
      return Math.max(0, m - moneyLost);
    });
  }
  
  if (punishment.beerPercent) {
    handlers.setBeer((b: number) => {
      beerLost = Math.floor(b * punishment.beerPercent!);
      return Math.max(0, b - beerLost);
    });
  }
  
  handlers.adjustMoral(punishment.moral);
  
  const dialog = getRandomDialog("sell", handlers.moral);
  handlers.showSkeletonComment(dialog);
  
  handlers.pushLog(`[STRAF] ${punishment.title}: ${punishment.message}`);
  if (moneyLost > 0) {
    handlers.pushLog(`→ Geld verloren: €${moneyLost}`);
  }
  if (beerLost > 0) {
    handlers.pushLog(`→ Bier verloren: ${beerLost.toFixed(0)} cl`);
  }
}

