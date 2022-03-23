/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import { ColorModeProvider, TabGroupChoiceProvider, AnnouncementBarProvider, DocsPreferredVersionContextProvider, MobileSecondaryMenuProvider, ScrollControllerProvider } from "@docusaurus/theme-common";

import { ThemeProvider } from "@momentum-ui/react-collaboration";
import { useColorMode } from "@docusaurus/theme-common";

const MomentumProvider = ({ children }) => {
  const { isDarkTheme } = useColorMode();
  return <ThemeProvider theme={isDarkTheme ? "darkWebex" : "lightWebex"}>{children}</ThemeProvider>;
};

export default function LayoutProviders({ children }) {
  return (
    <ColorModeProvider>
      <AnnouncementBarProvider>
        <TabGroupChoiceProvider>
          <ScrollControllerProvider>
            <DocsPreferredVersionContextProvider>
              <MobileSecondaryMenuProvider>
                <MomentumProvider>{children}</MomentumProvider>
              </MobileSecondaryMenuProvider>
            </DocsPreferredVersionContextProvider>
          </ScrollControllerProvider>
        </TabGroupChoiceProvider>
      </AnnouncementBarProvider>
    </ColorModeProvider>
  );
}
