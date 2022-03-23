import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Cross-platform",
    Svg: require("@momentum-ui/illustrations/svg/collaboration-anywhere-320.svg").default,
    description: "The Momentum Design Tokens doesn't just target one platform. All Webex platforms (iOS, MacOS, Windows, Linux, Web) share all the design data to ensure consistency.",
  },
  {
    title: "Automated",
    Svg: require("@momentum-ui/illustrations/svg/learning-button-cards-320.svg").default,
    description: "Tokens are generated automatically for each platforms, and consumed by the clients.",
  },
  {
    title: "Powered by collaboration",
    Svg: require("@momentum-ui/illustrations/svg/join-a-meeting-320.svg").default,
    description: "Design and Engineering work together on this system, ensuring both sides understand the requirements.",
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg key="title" className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
