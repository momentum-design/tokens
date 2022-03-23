import React from "react";
import { ThemeToken } from "../ThemeToken";

export const ThemeBackground = ({ gradation }) => {
  return (
    <>
      <div
        style={{
          border: "1px solid var(--theme-text-primary-normal)",
          marginBottom: "1rem",
          position: "relative",
          borderRadius: "0.75rem",
          height: "11rem",
          width: "18rem",
          background: `linear-gradient(180deg, ${gradation["primary-0"]} 0%, ${gradation["primary-1"]} 100%)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            borderRadius: "0.75rem  0 0.75rem 0",
            width: "15.5rem",
            height: "9.5rem",
            bottom: "0",
            right: "0",
            padding: "1rem",
            background: `linear-gradient(180deg, ${gradation["secondary-0"]} 0%, ${gradation["secondary-1"]} 100%)`,
          }}
        ></div>
      </div>
      <ThemeToken token={{ name: "--theme-background-gradient-primary-0", value: gradation["primary-0"] }} />
      <ThemeToken token={{ name: "--theme-background-gradient-primary-1", value: gradation["primary-1"] }} />
      <ThemeToken token={{ name: "--theme-background-gradient-secondary-0", value: gradation["secondary-0"] }} />
      <ThemeToken token={{ name: "--theme-background-gradient-secondary-1", value: gradation["secondary-1"] }} />
    </>
  );
};
