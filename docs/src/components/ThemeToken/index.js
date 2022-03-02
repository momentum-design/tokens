import React from "react";

export const ThemeToken = ({ token }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "0.25rem" }}>
      <div style={{ backgroundColor: token.value, width: "2rem", height: "1rem", borderRadius: "0.25rem", border: "1px solid var(--ifm-font-color-base)" }}></div>
      <code style={{ margin: 0, marginLeft: "1rem" }}> --{token.name} </code>
    </div>
  );
};
