import {
  Box,
  Spacer,
  Text,
  useApp,
  useInput,
  useStdin,
  useWindowSize,
} from "ink";
import React, { useEffect, useState } from "react";
import {
  startWatcher,
  type DashboardFill,
  type MarketValueSource,
  type WatcherSnapshot,
} from "./engine.ts";
import { publishMarket } from "./firebase.ts";

const yesColor = "#90B64F";
const noColor = "#D6503C";
const cream = "#F7E0B8";
const muted = "#A89B7A";

function useNow(intervalMs = 1_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}

function useWatcher() {
  const [snapshot, setSnapshot] = useState<WatcherSnapshot>({
    phase: "connecting",
    message: "Connecting to DreamDex",
    fillCount: 0,
    fills: [],
  });
  const [syncError, setSyncError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    void startWatcher((next) => {
      setSnapshot(next);
      void publishMarket(next).then(
        () => setSyncError(undefined),
        (error) =>
          setSyncError(error instanceof Error ? error.message : "Sync failed"),
      );
    }, controller.signal);
    return () => controller.abort();
  }, []);

  return { snapshot, syncError };
}

function formatPercent(value: number | undefined) {
  if (value === undefined) return "—";
  return `${(value * 100).toFixed(2)}%`;
}

function formatNumber(value: number | undefined) {
  if (value === undefined) return "—";
  return value.toLocaleString("en", { maximumFractionDigits: 2 });
}

function formatClock(timestamp: number | undefined) {
  if (timestamp === undefined || !Number.isFinite(timestamp)) return "—";
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

function formatRemaining(expirySeconds: number | undefined, now: number) {
  if (expirySeconds === undefined) return undefined;
  const remaining = Math.max(0, expirySeconds * 1000 - now);
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (totalSeconds <= 0) return "expired · switching";
  if (minutes <= 0) return `${seconds}s left`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s left`;
}

function formatRetry(retryAt: number | undefined, now: number) {
  if (retryAt === undefined) return undefined;
  const remaining = Math.max(0, Math.ceil((retryAt - now) / 1000));
  return remaining === 0 ? "retrying" : `retry in ${remaining}s`;
}

function formatSource(source: MarketValueSource | undefined) {
  if (source === "last_price") return "last price";
  return source ?? "—";
}

function formatSide(side: string | undefined) {
  if (!side) return "—";
  return side.replaceAll("_", " ");
}

function sideColor(side: string | undefined) {
  if (!side) return muted;
  if (side.includes("YES")) return yesColor;
  if (side.includes("NO")) return noColor;
  return cream;
}

function phaseColor(phase: WatcherSnapshot["phase"]) {
  if (phase === "watching") return yesColor;
  if (phase === "error") return noColor;
  return "#E4B04A";
}

function phaseLabel(phase: WatcherSnapshot["phase"]) {
  if (phase === "watching") return "LIVE";
  if (phase === "waiting") return "WAIT";
  if (phase === "error") return "ERR";
  return "SYNC";
}

function ProbabilityBar({ yes, width }: { yes: number; width: number }) {
  const filled = Math.round(Math.max(0, Math.min(1, yes)) * width);
  return (
    <Box>
      <Text color={yesColor}>{"█".repeat(filled)}</Text>
      <Text color={noColor}>{"░".repeat(Math.max(0, width - filled))}</Text>
    </Box>
  );
}

function Header({ snapshot, now }: { snapshot: WatcherSnapshot; now: number }) {
  const remaining = formatRemaining(snapshot.expirySeconds, now);

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color={cream}>
          RIZZ
        </Text>
        <Text dimColor>  watcher</Text>
        <Spacer />
        <Text color={muted}>BTC 15m</Text>
      </Box>
      <Box>
        <Text color={cream} wrap="truncate">
          {snapshot.marketSymbol ?? "No live market"}
        </Text>
        <Spacer />
        <Text color={phaseColor(snapshot.phase)} bold>
          ● {phaseLabel(snapshot.phase)}
        </Text>
        {remaining ? (
          <Text color={muted}>
            {"  "}
            {remaining}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
}

function OutcomeCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | undefined;
  color: string;
}) {
  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      paddingX={1}
      borderStyle="round"
      borderColor={color}
    >
      <Text color={color} bold>
        {label}
      </Text>
      <Text color={color} bold>
        {formatPercent(value)}
      </Text>
    </Box>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box marginRight={3}>
      <Text color={muted}>{label} </Text>
      <Text color={cream}>{value}</Text>
    </Box>
  );
}

function FillRow({ fill }: { fill: DashboardFill }) {
  return (
    <Box>
      <Box width={10}>
        <Text color={muted}>{formatClock(fill.timestamp)}</Text>
      </Box>
      <Box width={12}>
        <Text color={sideColor(fill.side)}>{formatSide(fill.side)}</Text>
      </Box>
      <Box width={10}>
        <Text color={cream}>{formatPercent(fill.price)}</Text>
      </Box>
      <Box width={10} justifyContent="flex-end">
        <Text>{formatNumber(fill.amount)}</Text>
      </Box>
      <Box width={10} justifyContent="flex-end">
        <Text color={muted}>{formatNumber(fill.cost)}</Text>
      </Box>
    </Box>
  );
}

function Fills({ fills }: { fills: DashboardFill[] }) {
  return (
    <Box flexDirection="column">
      <Box>
        <Box width={10}>
          <Text color={muted} bold>
            TIME
          </Text>
        </Box>
        <Box width={12}>
          <Text color={muted} bold>
            SIDE
          </Text>
        </Box>
        <Box width={10}>
          <Text color={muted} bold>
            YES
          </Text>
        </Box>
        <Box width={10} justifyContent="flex-end">
          <Text color={muted} bold>
            SIZE
          </Text>
        </Box>
        <Box width={10} justifyContent="flex-end">
          <Text color={muted} bold>
            COST
          </Text>
        </Box>
      </Box>
      {fills.length === 0 ? (
        <Text color={muted}>Waiting for fills…</Text>
      ) : (
        fills.map((fill) => <FillRow key={fill.id} fill={fill} />)
      )}
    </Box>
  );
}

function StatusPanel({
  snapshot,
  now,
}: {
  snapshot: WatcherSnapshot;
  now: number;
}) {
  const retry = formatRetry(snapshot.retryAt, now);

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={cream}>{snapshot.message ?? "Working"}</Text>
      {retry ? <Text color={muted}>{retry}</Text> : null}
    </Box>
  );
}

export function DashboardView({
  snapshot,
  syncError,
}: {
  snapshot: WatcherSnapshot;
  syncError?: string;
}) {
  const now = useNow();
  const { columns } = useWindowSize();
  const barWidth = Math.max(16, Math.min(48, columns - 8));
  const showMarket = snapshot.phase === "watching" && snapshot.yes !== undefined;

  return (
    <Box
      flexDirection="column"
      paddingX={1}
      paddingY={1}
      borderStyle="round"
      borderColor={cream}
    >
      <Header snapshot={snapshot} now={now} />

      {showMarket ? (
        <Box flexDirection="column" marginTop={1} gap={1}>
          <Box gap={1}>
            <OutcomeCard label="YES" value={snapshot.yes} color={yesColor} />
            <OutcomeCard label="NO" value={snapshot.no} color={noColor} />
          </Box>

          <ProbabilityBar yes={snapshot.yes ?? 0.5} width={barWidth} />

          <Box>
            <Stat label="source" value={formatSource(snapshot.source)} />
            <Stat label="fills" value={String(snapshot.fillCount)} />
            <Stat label="book" value={formatPercent(snapshot.bookYes)} />
            <Stat label="last fill" value={formatPercent(snapshot.lastFillYes)} />
          </Box>

          <Fills fills={snapshot.fills} />
        </Box>
      ) : (
        <StatusPanel snapshot={snapshot} now={now} />
      )}

      <Box marginTop={1}>
        <Text color={muted}>q quit · auto-switches on expiry · </Text>
        <SyncStatus error={syncError} />
      </Box>
    </Box>
  );
}

function QuitOnQ() {
  const { exit } = useApp();

  useInput((input) => {
    if (input === "q") exit();
  });

  return null;
}

function SyncStatus({ error }: { error?: string }) {
  if (error) {
    return <Text color={noColor}>rtb {error}</Text>;
  }

  return <Text color={muted}>rtb market</Text>;
}

export function Dashboard() {
  const { isRawModeSupported } = useStdin();
  const { snapshot, syncError } = useWatcher();

  return (
    <>
      {isRawModeSupported ? <QuitOnQ /> : null}
      <DashboardView snapshot={snapshot} syncError={syncError} />
    </>
  );
}
