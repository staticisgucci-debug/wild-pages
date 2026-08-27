"use client";

import { useEffect, useRef } from "react";
import type { ReaderFont, Settings, TextSize, Theme } from "@/lib/settings";

type Props = {
  settings: Settings;
  onChange: (next: Settings) => void;
  onClose: () => void;
};

export default function SettingsSheet({ settings, onChange, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Escape closes it, and focus moves into the sheet so a keyboard or screen
  // reader user isn't left behind on the page underneath.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    sheetRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <>
      <button className="sheet-backdrop" aria-label="Close settings" onClick={onClose} />
      <div
        ref={sheetRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Reading settings"
      >
        <div className="sheet-grip" />

        <p className="sheet-label">Light</p>
        <div className="seg">
          {(
            [
              ["daylight", "Daylight"],
              ["campfire", "Campfire"],
            ] as [Theme, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={settings.theme === value}
              onClick={() => set("theme", value)}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="sheet-label">Text size</p>
        <div className="seg">
          {(
            [
              ["s", "Aa", "0.95rem"],
              ["m", "Aa", "1.15rem"],
              ["l", "Aa", "1.4rem"],
            ] as [TextSize, string, string][]
          ).map(([value, label, size]) => (
            <button
              key={value}
              aria-pressed={settings.size === value}
              aria-label={
                value === "s" ? "Small text" : value === "m" ? "Medium text" : "Large text"
              }
              onClick={() => set("size", value)}
              style={{ fontSize: size }}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="sheet-label">Letters</p>
        <div className="seg">
          {(
            [
              ["storybook", "Storybook"],
              ["easy", "Easy Read"],
            ] as [ReaderFont, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={settings.font === value}
              onClick={() => set("font", value)}
              style={value === "easy" ? { fontFamily: "var(--font-easy), system-ui" } : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="sheet-label">Movement</p>
        <div className="seg">
          <button
            aria-pressed={!settings.stillness}
            onClick={() => set("stillness", false)}
          >
            Drifting
          </button>
          <button aria-pressed={settings.stillness} onClick={() => set("stillness", true)}>
            Stillness
          </button>
        </div>

        <button
          className="icon-btn"
          style={{ width: "100%", height: "3rem", border: "1.5px solid var(--rule)" }}
          onClick={onClose}
        >
          Back to the story
        </button>
      </div>
    </>
  );
}
