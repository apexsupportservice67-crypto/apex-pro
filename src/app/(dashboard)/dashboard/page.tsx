import React from "react";
import { useTradeStore } from "../../../store/useTradeStore";
import { DashboardHome } from "../../../components/dashboard/DashboardHome";
import { TradingTerminal } from "../../../components/trading/TradingTerminal";
import { DepositView } from "../../../components/deposit/DepositView";
import { WithdrawalView } from "../../../components/withdraw/WithdrawalView";
import { AssetsView } from "../../../components/assets/AssetsView";
import { SignalsView } from "../../../components/signals/SignalsView";
import { ColdStorageView } from "../../../components/coldstorage/ColdStorageView";
import { CardsView } from "../../../components/cards/CardsView";
import { InvestingView } from "../../../components/investing/InvestingView";
import { SubscribeView } from "../../../components/subscribe/SubscribeView";
import { SettingsView } from "../../../components/settings/SettingsView";

export default function DashboardPage() {
  const { activeTab } = useTradeStore();

  switch (activeTab) {
    case "dashboard":
      return <DashboardHome />;
    case "trading":
      return <TradingTerminal />;
    case "deposit":
      return <DepositView />;
    case "withdraw":
      return <WithdrawalView />;
    case "assets":
      return <AssetsView />;
    case "signals":
      return <SignalsView />;
    case "cold-storage":
      return <ColdStorageView />;
    case "cards":
      return <CardsView />;
    case "investing":
      return <InvestingView />;
    case "subscribe":
      return <SubscribeView />;
    case "settings":
      return <SettingsView />;
    default:
      return <DashboardHome />;
  }
}
